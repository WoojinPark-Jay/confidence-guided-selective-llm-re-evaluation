# Public release audit

Audit date: 2026-10-12

This audit treats the repository as a public research artifact rather than assuming that a successful notebook run is sufficient. It covers the current tracked tree and, for secret scanning, all reachable Git blobs.

## Verified

- The tracked release contains no raw Reddit title or body, Reddit URL, username, private Drive file ID, API token, private key, or personal email address detected by the release and history scans.
- All ten notebooks have English documentation, stripped outputs and execution counts, current filenames, parseable Python cells, pinned model revisions, and no opaque embedded data payload.
- The public Mixed Emotion notebooks reconstruct their inputs from the public synthetic text and a text-free Phase 1 file. The reconstructed 300 rows match the former release input exactly by ID, target, Phase 1 label, confidence, and routing flag.
- All 15 prediction files have unique IDs, the expected label-only schema, valid three-class labels, and aligned target and Phase 1 labels within each dataset.
- Accuracy, Macro F1, corrected and introduced errors, 15 confusion matrices, 15 class reports, 15 Phase 1 paired tests, 10 protocol paired tests, bootstrap intervals, and Holm adjustments were independently recomputed from the released row-level labels.
- The annotation audit reproduces 277/300 agreement, unweighted Cohen's kappa of 0.8846886594, its bootstrap interval, target agreement counts, and the confidence-rating summary.
- The checksum manifest covers every tracked file except the checksum manifest itself when validation runs in a Git checkout.
- The project metadata and repository license both identify the original software as MIT licensed.

## Intentional boundaries

- Raw Reddit-derived inputs, post-linked free-form generations, the 1.4 GB source table, and model weights are not public artifacts.
- Generic Colab mount locations such as `/content/drive/MyDrive` are runtime defaults, not personal Drive identifiers.
- `CITATION.cff.template` intentionally retains release-date and DOI placeholders until the complete author metadata and archival DOI are approved. It is not an active `CITATION.cff`.
- The Llama 2 saved SELF-DISCOVER plan is the unedited plan used in the reported run, even where it does not fully follow the requested compact structure.
- Inference notebooks use `trust_remote_code=True` only with pinned model revisions. This is an explicit upstream-code trust boundary for reruns.
- The workload table reports measured model-generation regions, not complete service latency, energy, or monetary cost.

## Still requires author action before archival publication

- Replace the citation template with final authors, affiliations, release date, paper DOI, and archival DOI.
- Confirm the final ethics/platform-terms language and any controlled-access process for restricted artifacts.
- Confirm and state the distribution license for the original synthetic dataset and anonymized annotation-audit records.
- Confirm the distribution terms for each external model and restricted source dataset.
- Create the exact manuscript-linked release tag after all author approvals.

## Verification command

Run `make verify` from a clean clone. A release is not ready if any command fails or if `git status --short` is nonempty afterward.
