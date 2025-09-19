from __future__ import annotations

import base64
import json
import os
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import requests


def _get_env(name: str, default: Optional[str] = None) -> Optional[str]:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip() or default


def _timestamp() -> str:
    return time.strftime("%Y%m%d-%H%M%S")


@dataclass
class FreepikImageClient:
    api_key: str
    generate_url: str
    auth_type: str = field(default="x-api-key")
    default_output_dir: Path = field(default_factory=lambda: Path("backend/generate_image/outputs"))
    request_timeout_sec: int = field(default=120)
    session: requests.Session = field(default_factory=requests.Session, repr=False)

    @classmethod
    def from_env(cls) -> "FreepikImageClient":
        try:
            # Optional: load .env if python-dotenv is available
            # This import is safe to fail silently if not installed
            from dotenv import load_dotenv  # type: ignore

            load_dotenv()
        except Exception:
            pass

        api_key = _get_env("FREEPIK_API_KEY") or _get_env("FREEPIK_TOKEN")
        if not api_key:
            raise ValueError("FREEPIK_API_KEY もしくは FREEPIK_TOKEN が環境変数に設定されていません。")

        # Most Freepik examples seen in the wild use a v1 AI path. Keep this configurable.
        generate_url = _get_env("FREEPIK_GENERATE_URL") or "https://api.freepik.com/v1/ai/mystic"

        auth_type = (_get_env("FREEPIK_AUTH_TYPE", "x-api-key") or "x-api-key").lower()

        out_dir = Path(_get_env("FREEPIK_OUTPUT_DIR", str(Path("backend/generate_image/outputs").resolve())))
        return cls(
            api_key=api_key,
            generate_url=generate_url,
            auth_type=auth_type,
            default_output_dir=out_dir,
        )

    def _build_headers(self, extra_headers: Optional[Dict[str, str]] = None) -> Dict[str, str]:
        headers: Dict[str, str] = {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
        if self.auth_type in ("bearer", "authorization"):
            headers["Authorization"] = f"Bearer {self.api_key}"
        else:
            # Default to x-freepik-api-key
            headers["x-freepik-api-key"] = self.api_key
        if extra_headers:
            headers.update(extra_headers)
        return headers

    def generate_image(
        self,
        prompt: str,
        *,
        aspect_ratio: Optional[str] = None,
        size: Optional[str] = None,
        num_images: int = 1,
        output_dir: Optional[Path] = None,
        filename_prefix: str = "freepik",
        extra_params: Optional[Dict[str, Any]] = None,
    ) -> List[Path]:
        if not prompt or not prompt.strip():
            raise ValueError("prompt は必須です。")

        payload: Dict[str, Any] = {"prompt": prompt.strip()}
        if aspect_ratio:
            payload["aspect_ratio"] = aspect_ratio
        if size:
            payload["size"] = size
        if num_images and num_images != 1:
            # Freepikの実装差異に備えて代表的なキーを両対応
            payload["n"] = num_images
            payload["num_images"] = num_images
        if extra_params:
            payload.update(extra_params)

        headers = self._build_headers()

        response = self.session.post(
            self.generate_url,
            headers=headers,
            data=json.dumps(payload),
            timeout=self.request_timeout_sec,
        )
        if response.status_code >= 400:
            raise RuntimeError(
                f"Freepik API エラー: status={response.status_code}, body={response.text[:500]}"
            )

        try:
            data = response.json()
        except Exception:
            # 稀に画像バイナリが直接返る可能性に備える
            output_dir_final = (output_dir or self.default_output_dir)
            output_dir_final.mkdir(parents=True, exist_ok=True)
            out_path = output_dir_final / f"{filename_prefix}-{_timestamp()}.png"
            out_path.write_bytes(response.content)
            return [out_path]

        urls, b64_images = self._extract_image_sources(data)
        if not urls and not b64_images:
            # 非同期ジョブ型レスポンスに簡易対応
            job_id = data.get("job_id") or data.get("id")
            status_url = data.get("status_url") or _get_env("FREEPIK_JOB_STATUS_URL_TEMPLATE")
            if job_id and status_url:
                status_endpoint = status_url.replace("{job_id}", str(job_id))
                urls, b64_images = self._poll_until_ready(status_endpoint)
            else:
                raise RuntimeError(
                    f"画像URLが抽出できませんでした。レスポンス: {json.dumps(data)[:500]}"
                )

        output_dir_final = (output_dir or self.default_output_dir)
        output_dir_final.mkdir(parents=True, exist_ok=True)

        saved_paths: List[Path] = []
        for i, u in enumerate(urls):
            path = output_dir_final / f"{filename_prefix}-{_timestamp()}-{i+1}.png"
            self._download(u, path)
            saved_paths.append(path)

        for i, b64 in enumerate(b64_images, start=len(saved_paths) + 1):
            path = output_dir_final / f"{filename_prefix}-{_timestamp()}-{i}.png"
            self._save_base64_png(b64, path)
            saved_paths.append(path)

        return saved_paths

    def generate_image_bytes(
        self,
        prompt: str,
        *,
        aspect_ratio: Optional[str] = None,
        size: Optional[str] = None,
        num_images: int = 1,
        extra_params: Optional[Dict[str, Any]] = None,
    ) -> List[bytes]:
        if not prompt or not prompt.strip():
            raise ValueError("prompt は必須です。")

        payload: Dict[str, Any] = {"prompt": prompt.strip()}
        if aspect_ratio:
            payload["aspect_ratio"] = aspect_ratio
        if size:
            payload["size"] = size
        if num_images and num_images != 1:
            payload["n"] = num_images
            payload["num_images"] = num_images
        if extra_params:
            payload.update(extra_params)

        headers = self._build_headers()

        response = self.session.post(
            self.generate_url,
            headers=headers,
            data=json.dumps(payload),
            timeout=self.request_timeout_sec,
        )
        if response.status_code >= 400:
            raise RuntimeError(
                f"Freepik API エラー: status={response.status_code}, body={response.text[:500]}"
            )

        try:
            data = response.json()
        except Exception:
            return [response.content]

        urls, b64_images = self._extract_image_sources(data)
        if not urls and not b64_images:
            job_id = data.get("job_id") or data.get("id")
            status_url = data.get("status_url") or _get_env("FREEPIK_JOB_STATUS_URL_TEMPLATE")
            if job_id and status_url:
                status_endpoint = status_url.replace("{job_id}", str(job_id))
                urls, b64_images = self._poll_until_ready(status_endpoint)
            else:
                raise RuntimeError(
                    f"画像URLが抽出できませんでした。レスポンス: {json.dumps(data)[:500]}"
                )

        results: List[bytes] = []
        for u in urls:
            with self.session.get(u, timeout=self.request_timeout_sec) as r:
                if r.status_code >= 400:
                    raise RuntimeError(f"画像のダウンロードに失敗しました: status={r.status_code}")
                results.append(r.content)

        for b64 in b64_images:
            raw = b64
            if "," in raw:
                raw = raw.split(",", 1)[1]
            results.append(base64.b64decode(raw))

        return results

    def _download(self, url: str, out_path: Path) -> None:
        with self.session.get(url, stream=True, timeout=self.request_timeout_sec) as r:
            if r.status_code >= 400:
                raise RuntimeError(f"画像のダウンロードに失敗しました: status={r.status_code}")
            with out_path.open("wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)

    def _save_base64_png(self, b64_data: str, out_path: Path) -> None:
        raw = b64_data
        if "," in raw:
            # data URL 形式の可能性
            raw = raw.split(",", 1)[1]
        out_path.write_bytes(base64.b64decode(raw))

    def _extract_image_sources(self, data: Dict[str, Any]) -> Tuple[List[str], List[str]]:
        urls: List[str] = []
        b64s: List[str] = []

        # 単一URL
        if isinstance(data.get("image_url"), str):
            urls.append(str(data["image_url"]))

        # 複数URL
        if isinstance(data.get("image_urls"), list):
            urls.extend([str(u) for u in data.get("image_urls", []) if isinstance(u, str)])

        # data配列（OpenAI風）
        d = data.get("data")
        if isinstance(d, list):
            for item in d:
                if isinstance(item, dict):
                    if isinstance(item.get("url"), str):
                        urls.append(str(item["url"]))
                    if isinstance(item.get("b64_json"), str):
                        b64s.append(str(item["b64_json"]))

        # images配列（一般化）
        images = data.get("images")
        if isinstance(images, list):
            for item in images:
                if isinstance(item, dict):
                    if isinstance(item.get("url"), str):
                        urls.append(str(item["url"]))
                    for key in ("b64", "base64", "b64_png", "b64_json"):
                        if isinstance(item.get(key), str):
                            b64s.append(str(item[key]))

        # output内
        output = data.get("output")
        if isinstance(output, dict):
            for key in ("url", "image_url", "final"):
                v = output.get(key)
                if isinstance(v, str):
                    urls.append(v)
                if isinstance(v, list):
                    urls.extend([str(u) for u in v if isinstance(u, str)])

        # 重複除去
        urls = list(dict.fromkeys(urls))
        b64s = list(dict.fromkeys(b64s))
        return urls, b64s

    def _poll_until_ready(self, status_url: str, *, max_wait_sec: int = 180, interval_sec: float = 2.0) -> Tuple[List[str], List[str]]:
        start = time.time()
        while True:
            r = self.session.get(status_url, headers=self._build_headers(), timeout=self.request_timeout_sec)
            if r.status_code >= 400:
                raise RuntimeError(f"Freepik ジョブ監視エラー: status={r.status_code}, body={r.text[:300]}")
            try:
                data = r.json()
            except Exception:
                raise RuntimeError("ジョブ監視のレスポンスがJSONではありません")

            status = str(data.get("status") or data.get("state") or "").lower()
            if status in ("done", "completed", "succeeded", "success", "ready"):
                return self._extract_image_sources(data)
            if status in ("failed", "error"):
                raise RuntimeError(f"画像生成が失敗しました: {json.dumps(data)[:500]}")

            if time.time() - start > max_wait_sec:
                raise TimeoutError("画像生成の完了待ちがタイムアウトしました")
            time.sleep(interval_sec)


__all__ = ["FreepikImageClient"]


