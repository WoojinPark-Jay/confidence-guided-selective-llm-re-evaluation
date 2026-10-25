# Provenance

The [2026-10-25 manuscript synchronization note](../docs/manuscript_sync_20261025.md) records the editorial-only manuscript update and its corresponding collaborator commit. Experimental artifacts are unchanged.

`notebook_sources.csv` links each cleaned release notebook to the exact local source notebook used to create it and records both hashes. `manifests/` contains sanitized copies of run manifests; only machine-specific paths are replaced, while hashes, revisions, settings, row counts, and protocol names are preserved.

In `provenance/manifests/additional9000_llama3_phase2.json`, `phase1_handoff.phase2_executed` remains `false` because that nested object is the immutable pre-execution handoff embedded in the run manifest. It does not describe the completion state of the enclosing Phase 2 run. Completed execution is evidenced by `results/reports/additional9000_audit_evidence.json`, which verifies all three outputs and 777 generation calls.

`release_checksums.sha256` is the integrity manifest for the repository contents. Regenerate it only after an intentional release edit:

```bash
python3 scripts/generate_checksums.py
```

Then run the full release validator and commit the changed checksum file together with the intended edit.
