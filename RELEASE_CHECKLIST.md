# Archival release checklist

## Required before the manuscript-linked archival release

- [ ] Confirm final author list and replace `CITATION.cff.template` with `CITATION.cff`.
- [x] Apply the MIT License to the original software in this repository; externally sourced data and model artifacts remain governed by their own terms.
- [ ] Add the final paper DOI, repository URL, and release tag.
- [ ] Confirm Data/Code Availability language against the actual access mechanism.
- [ ] Confirm IRB/not-human-subjects and platform-terms language with all authors or the institution.
- [ ] Place model weights in the approved external location or document the request process.
- [x] Confirm no raw Reddit text or free-form Reddit-linked generations are tracked.
- [ ] Run all validation commands from a clean clone.
- [ ] Review every notebook cell for output, personal paths, tokens, and obsolete result claims.
- [ ] Tag the exact public release used by the submitted manuscript.

## Automated gate

```bash
python3 scripts/reproduce_results.py
python3 scripts/reproduce_statistics.py
python3 scripts/validate_release.py
python3 -m unittest discover -s tests -v
git status --short
```

The final `git status` must be clean. Do not publish when `validate_release.py` reports an error.
