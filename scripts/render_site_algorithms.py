"""Render only the four author-requested algorithm regions from the verified PDF.

Requires Poppler pdftoppm. The complete manuscript is not copied into the site.
Crop coordinates are PDF points (top-left origin), checked against printed rules.
"""
import argparse
import hashlib
import math
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
SOURCE_SHA = '71efd665614d591102ecdb1bb7c977c78329cf1a963af47f46d8b38d1789b8a5'
CROPS = [(9, 33, 54, 249, 159), (9, 33, 217, 249, 162),
         (9, 294, 54, 249, 126), (10, 294, 298, 249, 167)]


def render(source):
    source = Path(source)
    assert hashlib.sha256(source.read_bytes()).hexdigest() == SOURCE_SHA
    for number, (page, x, y, width, height) in enumerate(CROPS, 1):
        scale = 300 / 72
        destination = ROOT / 'site/assets' / ('algorithm-%d' % number)
        subprocess.run(['pdftoppm', '-f', str(page), '-l', str(page), '-singlefile',
                        '-r', '300', '-x', str(math.floor(x * scale)), '-y', str(math.floor(y * scale)),
                        '-W', str(math.ceil(width * scale)), '-H', str(math.ceil(height * scale)),
                        '-png', str(source), str(destination)], check=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source_pdf')
    render(parser.parse_args().source_pdf)
