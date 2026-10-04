#!/usr/bin/env python3
"""Regenerate the release checksum manifest after an intentional release edit."""

from __future__ import annotations

import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "provenance" / "release_checksums.sha256"
EXCLUDED = {OUTPUT}


def digest(path: Path) -> str:
    value = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            value.update(chunk)
    return value.hexdigest()


def main() -> None:
    files = [
        path for path in ROOT.rglob("*")
        if path.is_file() and ".git" not in path.parts and path not in EXCLUDED
    ]
    lines = [f"{digest(path)}  {path.relative_to(ROOT)}" for path in sorted(files)]
    OUTPUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {len(lines)} checksums to {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
