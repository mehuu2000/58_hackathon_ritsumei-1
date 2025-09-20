from __future__ import annotations

import os
import time
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional, Tuple

import boto3


def _get_env(name: str, default: Optional[str] = None) -> Optional[str]:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip() or default


def _timestamp() -> str:
    return time.strftime("%Y%m%d-%H%M%S")


@dataclass
class R2Storage:
    access_key_id: str
    secret_access_key: str
    account_id: str
    bucket_name: str
    public_base_url: str
    endpoint_url: str = field(init=False)

    def __post_init__(self) -> None:
        self.endpoint_url = f"https://{self.account_id}.r2.cloudflarestorage.com"
        self._client = boto3.client(
            "s3",
            aws_access_key_id=self.access_key_id,
            aws_secret_access_key=self.secret_access_key,
            endpoint_url=self.endpoint_url,
            region_name="auto",
        )

    @classmethod
    def from_env(cls) -> "R2Storage":
        try:
            from dotenv import load_dotenv  # type: ignore

            load_dotenv()
        except Exception:
            pass

        access_key = _get_env("R2_ACCESS_KEY_ID")
        secret_key = _get_env("R2_SECRET_ACCESS_KEY")
        account_id = _get_env("R2_ACCOUNT_ID")
        bucket = _get_env("R2_BUCKET")
        public_base_url = _get_env("R2_PUBLIC_BASE_URL")

        if not all([access_key, secret_key, account_id, bucket, public_base_url]):
            raise ValueError(
                "R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ACCOUNT_ID, R2_BUCKET, R2_PUBLIC_BASE_URL を設定してください。"
            )

        return cls(
            access_key_id=str(access_key),
            secret_access_key=str(secret_key),
            account_id=str(account_id),
            bucket_name=str(bucket),
            public_base_url=str(public_base_url),
        )

    def generate_key(self, *, prefix: str = "images/freepik", ext: str = ".png") -> str:
        return f"{prefix}/{_timestamp()}-{uuid.uuid4().hex}{ext}"

    def upload_bytes(self, data: bytes, *, key: Optional[str] = None, content_type: str = "image/png") -> Tuple[str, str]:
        obj_key = key or self.generate_key()
        self._client.put_object(
            Bucket=self.bucket_name,
            Key=obj_key,
            Body=data,
            ContentType=content_type,
            CacheControl="public, max-age=31536000, immutable",
        )
        public_url = self._build_public_url(obj_key)
        return obj_key, public_url

    def _build_public_url(self, key: str) -> str:
        base = self.public_base_url.rstrip("/")
        path = key.lstrip("/")
        return f"{base}/{path}"


__all__ = ["R2Storage"]


