from __future__ import annotations

from typing import List, Optional

from .client import FreepikImageClient
from .drive_storage import DriveStorage


def generate_and_upload_images(
    prompt: str,
    *,
    aspect_ratio: Optional[str] = None,
    size: Optional[str] = None,
    n: int = 1,
    prefix: str = "freepik",
    content_type: str = "image/png",
) -> List[str]:
    """Freepikで画像を生成し、Google Driveに保存して公開URL群を返す。

    環境変数:
      - FREEPIK_API_KEY / FREEPIK_TOKEN
      - FREEPIK_GENERATE_URL（任意）
      - FREEPIK_AUTH_TYPE（任意）
      - GOOGLE_SERVICE_ACCOUNT_FILE または GOOGLE_SERVICE_ACCOUNT_JSON
      - GOOGLE_DRIVE_FOLDER_ID（任意、保存先フォルダID）
    """
    if not prompt or not prompt.strip():
        raise ValueError("prompt は必須です。")

    client = FreepikImageClient.from_env()
    drive = DriveStorage.from_env()

    images = client.generate_image_bytes(
        prompt=prompt,
        aspect_ratio=aspect_ratio,
        size=size,
        num_images=n,
    )

    urls: List[str] = []
    for data in images:
        filename = f"{prefix}-{_safe_ts_suffix()}{_ext_for_content_type(content_type)}"
        _, url = drive.upload_bytes(
            data,
            filename=filename,
            mimetype=content_type,
            make_public=True,
        )
        urls.append(url)
    return urls


def generate_and_upload_image(
    prompt: str,
    *,
    aspect_ratio: Optional[str] = None,
    size: Optional[str] = None,
    prefix: str = "freepik",
    content_type: str = "image/png",
) -> str:
    """1枚だけ生成してURLを返すショートカット。"""
    urls = generate_and_upload_images(
        prompt=prompt,
        aspect_ratio=aspect_ratio,
        size=size,
        n=1,
        prefix=prefix,
        content_type=content_type,
    )
    return urls[0]


def _ext_for_content_type(content_type: str) -> str:
    c = (content_type or "").lower()
    if c in ("image/jpeg", "image/jpg"):
        return ".jpg"
    if c == "image/webp":
        return ".webp"
    return ".png"


def _safe_ts_suffix() -> str:
    import time, uuid
    return f"-{time.strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex}"


__all__ = [
    "generate_and_upload_images",
    "generate_and_upload_image",
]


