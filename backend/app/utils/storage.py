from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

PROJECT_ROOT = Path(__file__).resolve().parents[2]

UPLOAD_DIR = PROJECT_ROOT / "uploads" / "products"
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB

ALLOWED_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


async def save_product_image(file: UploadFile) -> str:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise ValueError(
            "فرمت تصویر باید JPG، PNG یا WEBP باشد."
        )

    extension = ALLOWED_CONTENT_TYPES[file.content_type]

    content = await file.read()

    if len(content) > MAX_IMAGE_SIZE:
        raise ValueError(
            "حجم تصویر نباید بیشتر از ۵ مگابایت باشد."
        )

    UPLOAD_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    filename = f"{uuid4().hex}{extension}"
    file_path = UPLOAD_DIR / filename

    file_path.write_bytes(content)

    return f"/uploads/products/{filename}"


def delete_product_image(image_url: str | None) -> None:
    if not image_url:
        return

    file_path = PROJECT_ROOT / image_url.lstrip("/")

    if file_path.exists() and file_path.is_file():
        file_path.unlink()