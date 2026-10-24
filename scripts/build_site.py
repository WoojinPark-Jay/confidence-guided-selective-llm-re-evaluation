"""Build a static release with content-addressed styles and scripts."""
import hashlib
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]


def build(destination=None):
    output = Path(destination) if destination else ROOT / 'build/site'
    output.mkdir(parents=True, exist_ok=True)
    shutil.copytree(ROOT / 'site', output, dirs_exist_ok=True)
    html = (output / 'index.html').read_text()
    for name in ('styles.css', 'app.js', 'results-data.js', 'prompt-data.js'):
        data = (ROOT / 'site' / name).read_bytes()
        source = Path(name)
        versioned = source.stem + '.' + hashlib.sha256(data).hexdigest()[:12] + source.suffix
        (output / versioned).write_bytes(data)
        reference = '"' + name + '"'
        assert html.count(reference) == 1, name
        html = html.replace(reference, '"' + versioned + '"')
    (output / 'index.html').write_text(html)
    return output


if __name__ == '__main__':
    print(build())
