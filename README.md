# Confidence-Guided Selective LLM Re-Evaluation

Reproducibility package for **“Confidence-Guided Selective LLM Re-Evaluation for Emotion Classification in Social Media.”**

Lead authors (equal contribution): **Woojin Park** and **Sangyun Kang**.

The system uses a calibrated DistilBERT classifier for Phase 1 and routes only low-confidence cases to Phase 2. Phase 2 compares Direct, chain-of-thought (CoT), and the final task-adapted SELF-DISCOVER protocol with Llama 2 and Llama 3. A parsed Phase 2 label replaces the Phase 1 prediction only for a routed case; if parsing fails, the Phase 1 label is retained.

> Research use only. The labels are proxy emotion labels and are not clinical diagnoses, screening outcomes, or treatment recommendations.

## What is in this repository

| Path | Purpose |
|---|---|
| `configs/` | Frozen Phase 1, routing, model, generation, and dataset settings |
| `notebooks/colab/` | Colab notebooks corresponding to the final experimental conditions |
| `prompts/` | Final Direct, CoT, and SELF-DISCOVER prompt materials |
| `plans/` | Frozen model-specific SELF-DISCOVER plans reused across datasets |
| `results/predictions/` | Text-free, row-aligned labels for all 15 final conditions |
| `results/reports/` | Verified metrics, paired statistics, confusion matrices, and class reports |
| `src/cgslr/` | Dependency-light metric and paired-test implementation |
| `scripts/` | Release validation and result reproduction commands |
| `data/` | Redistributable stress-test data plus manifests for restricted Reddit data |
| `provenance/` | Sanitized run manifests and source checksums |

Exploratory SELF-DISCOVER variants and superseded checkpoints are intentionally excluded. The reported SELF-DISCOVER condition is the final **v6c compact-plan protocol** only.

## Headline verified results

All values below were recomputed from row-aligned final predictions. Accuracy and Macro F1 use the complete evaluation denominator; parsing failures retain the Phase 1 label.

| Dataset | Model | Protocol | Accuracy | Macro F1 | Corrected | Introduced | Parse failures |
|---|---|---|---:|---:|---:|---:|---:|
| Reddit 12,000 | Llama 2 | Direct | 96.9917 | 96.9898 | 45 | 36 | 1 |
| Reddit 12,000 | Llama 2 | CoT | 96.9250 | 96.9240 | 48 | 47 | 0 |
| Reddit 12,000 | Llama 2 | SELF-DISCOVER | 96.9417 | 96.9391 | 52 | 49 | 21 |
| Reddit 12,000 | Llama 3 | Direct | 97.1083 | 97.1056 | 68 | 45 | 1 |
| Reddit 12,000 | Llama 3 | CoT | 97.1500 | 97.1471 | 63 | 35 | 1 |
| Reddit 12,000 | Llama 3 | SELF-DISCOVER | **97.2000** | **97.1990** | 72 | 38 | 2 |
| Mixed Emotion 300 | Llama 2 | Direct | 76.3333 | 75.1627 | 11 | 33 | 0 |
| Mixed Emotion 300 | Llama 2 | CoT | 79.0000 | 78.9298 | 19 | 33 | 0 |
| Mixed Emotion 300 | Llama 2 | SELF-DISCOVER | **89.3333** | **89.3452** | 22 | 5 | 0 |
| Mixed Emotion 300 | Llama 3 | Direct | 89.3333 | 89.3803 | 26 | 9 | 0 |
| Mixed Emotion 300 | Llama 3 | CoT | 84.6667 | 84.6760 | 15 | 12 | 0 |
| Mixed Emotion 300 | Llama 3 | SELF-DISCOVER | **92.6667** | **92.6966** | 28 | 1 | 1 |
| Additional Reddit 9,000 | Llama 3 | Direct | 97.7222 | 97.7242 | 32 | 19 | 2 |
| Additional Reddit 9,000 | Llama 3 | CoT | 97.7222 | 97.7234 | 28 | 15 | 0 |
| Additional Reddit 9,000 | Llama 3 | SELF-DISCOVER | **97.7667** | **97.7688** | 30 | 13 | 0 |

The final Llama 3 SELF-DISCOVER pipeline improved over Phase 1 on the 12,000-post Reddit test set and the separately held 9,000-post set. Its observed advantage over Direct and CoT on Reddit was small and not statistically distinguishable in the paired protocol-to-protocol tests. On the controlled Mixed Emotion stress test, SELF-DISCOVER was higher than Direct and CoT for both Llama models. See `results/reports/` for exact McNemar tests, Holm adjustments, and confidence intervals.

## Quick verification

Only Python 3.10+ is needed to reproduce the table from the text-free prediction files.

```bash
python3 scripts/reproduce_results.py
python3 scripts/reproduce_statistics.py
python3 scripts/validate_release.py
python3 -m unittest discover -s tests -v
```

The commands fail on a row-count mismatch, duplicate ID, invalid label, unexpected text-bearing column, metric mismatch, checksum mismatch, or leaked absolute user path.

The same gate runs in GitHub Actions on every push and pull request. Locally, all four checks can also be run with `make verify`.

## Re-running inference

1. Read `docs/REPRODUCIBILITY.md` and `data/README.md`.
2. Obtain the restricted Reddit inputs and final DistilBERT weights using the recorded hashes.
3. Set `HF_TOKEN` in the Colab secret store if gated model access requires it.
4. Run the numbered notebooks in `notebooks/colab/`.
5. Keep the frozen temperature `1.4801950079829693`, routing threshold `0.70`, routed-ID hashes, model revisions, and cached SELF-DISCOVER plans unchanged for a strict replication.
6. Run `scripts/reproduce_results.py` on the resulting text-free prediction exports.

The 9,000-post evaluation performs no training, calibration fitting, threshold search, prompt adjustment, or plan discovery. It loads the selected seed-42 DistilBERT model and the frozen Llama 3 protocols.

## Data and model boundaries

The repository does **not** contain:

- raw Reddit titles or post bodies;
- the 1.4 GB source corpus;
- Hugging Face model weights;
- the final fine-tuned DistilBERT weight file;
- free-form LLM generations tied to individual Reddit posts;
- local Drive paths, account credentials, or API tokens.

It does contain the synthetic Mixed Emotion stress test, text-free row-aligned labels, exact prompts, cached plans, model revisions, file hashes, and all aggregate evidence required to verify the reported metrics. See `DATA_AVAILABILITY.md` for the release boundary.

## Citation and license

The software is released under the MIT License; see `LICENSE`. `CITATION.cff` will be finalized after the complete author list and archival DOI are approved; until then, `CITATION.cff.template` records the confirmed lead authors and remaining citation fields.
