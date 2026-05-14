import uuid
from pathlib import Path


def ensure_dir(path: str | Path) -> Path:
    p = Path(path)
    p.mkdir(parents=True, exist_ok=True)
    return p


def save_upload_bytes(upload_dir: str | Path, original_filename: str, data: bytes) -> Path:
    """Write bytes to a unique file under upload_dir; returns absolute path."""
    base = ensure_dir(upload_dir)
    safe_name = Path(original_filename).name
    ext = Path(safe_name).suffix or ".bin"
    dest = base / f"{uuid.uuid4().hex}{ext}"
    dest.write_bytes(data)
    return dest.resolve()
