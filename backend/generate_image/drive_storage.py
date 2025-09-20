from __future__ import annotations

import io
import json
import os
import time
import uuid
from dataclasses import dataclass, field
from typing import Optional, Tuple

from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload


def _get_env(name: str, default: Optional[str] = None) -> Optional[str]:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip() or default


def _timestamp() -> str:
    return time.strftime("%Y%m%d-%H%M%S")


SCOPES = [
    "https://www.googleapis.com/auth/drive",
]


@dataclass
class DriveStorage:
    credentials: Credentials = field(repr=False)
    default_folder_id: Optional[str] = None

    @classmethod
    def from_env(cls) -> "DriveStorage":
        try:
            from dotenv import load_dotenv  # type: ignore

            load_dotenv()
        except Exception:
            pass

        sa_file = _get_env("GOOGLE_SERVICE_ACCOUNT_FILE")
        sa_json = _get_env("GOOGLE_SERVICE_ACCOUNT_JSON")
        folder_id = _get_env("GOOGLE_DRIVE_FOLDER_ID")

        if sa_file:
            creds = Credentials.from_service_account_file(sa_file, scopes=SCOPES)
        elif sa_json:
            creds = Credentials.from_service_account_info(json.loads(sa_json), scopes=SCOPES)
        else:
            raise ValueError("GOOGLE_SERVICE_ACCOUNT_FILE もしくは GOOGLE_SERVICE_ACCOUNT_JSON を設定してください。")

        return cls(credentials=creds, default_folder_id=folder_id)

    def _service(self):
        return build("drive", "v3", credentials=self.credentials, cache_discovery=False)

    def generate_filename(self, *, prefix: str = "freepik", ext: str = ".png") -> str:
        return f"{prefix}-{_timestamp()}-{uuid.uuid4().hex}{ext}"

    def upload_bytes(
        self,
        data: bytes,
        *,
        filename: Optional[str] = None,
        mimetype: str = "image/png",
        folder_id: Optional[str] = None,
        make_public: bool = True,
    ) -> Tuple[str, str]:
        service = self._service()
        used_folder = folder_id or self.default_folder_id
        file_metadata = {"name": filename or self.generate_filename(ext=_ext_for_mimetype(mimetype))}
        if used_folder:
            file_metadata["parents"] = [used_folder]

        media = MediaIoBaseUpload(io.BytesIO(data), mimetype=mimetype, resumable=False)
        created = service.files().create(
            body=file_metadata,
            media_body=media,
            fields="id, webViewLink, webContentLink, name",
            supportsAllDrives=True,
        ).execute()

        file_id = created["id"]

        if make_public:
            try:
                service.permissions().create(
                    fileId=file_id,
                    body={"type": "anyone", "role": "reader"},
                    fields="id",
                    supportsAllDrives=True,
                ).execute()
            except Exception:
                # すでに公開済み等のケースでも続行
                pass

        # React等から直接画像として参照できるURL（コンテンツ直リンク）
        direct_url = f"https://drive.google.com/uc?id={file_id}"
        return file_id, direct_url


def _ext_for_mimetype(mimetype: str) -> str:
    m = (mimetype or "").lower()
    if m in ("image/jpeg", "image/jpg"):
        return ".jpg"
    if m == "image/webp":
        return ".webp"
    return ".png"


__all__ = ["DriveStorage"]


