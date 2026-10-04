# Provenance

`notebook_sources.csv` links each cleaned release notebook to the exact local source notebook used to create it and records both hashes. `manifests/` contains sanitized copies of run manifests; only machine-specific paths are replaced, while hashes, revisions, settings, row counts, and protocol names are preserved.

`release_checksums.sha256` is the integrity manifest for the repository contents. Regenerate it only after an intentional release edit:

```bash
python3 scripts/generate_checksums.py
```

Then run the full release validator and commit the changed checksum file together with the intended edit.

