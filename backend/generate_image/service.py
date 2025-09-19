from __future__ import annotations

from typing import List, Optional

from .client import FreepikImageClient
from .r2_storage import R2Storage


def generate_and_upload_images(
    prompt: str,
    *,
    aspect_ratio: Optional[str] = None,
    size: Optional[str] = None,
    n: int = 1,
    prefix: str = "freepik",
    content_type: str = "image/png",
) -> List[str]:
    """Freepikで画像を生成し、Cloudflare R2に保存して公開URL群を返す。

    環境変数:
      - FREEPIK_API_KEY / FREEPIK_TOKEN
      - FREEPIK_GENERATE_URL（任意）
      - FREEPIK_AUTH_TYPE（任意）
      - R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_ACCOUNT_ID / R2_BUCKET / R2_PUBLIC_BASE_URL
    """
    if not prompt or not prompt.strip():
        raise ValueError("prompt は必須です。")

    client = FreepikImageClient.from_env()
    r2 = R2Storage.from_env()

    images = client.generate_image_bytes(
        prompt=prompt,
        aspect_ratio=aspect_ratio,
        size=size,
        num_images=n,
    )

    urls: List[str] = []
    ext = _ext_for_content_type(content_type)
    for data in images:
        key = r2.generate_key(prefix=f"images/{prefix}", ext=ext)
        _, url = r2.upload_bytes(data, key=key, content_type=content_type)
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


__all__ = [
    "generate_and_upload_images",
    "generate_and_upload_image",
]


