# Final audit report

All 15 reported conditions were verified from row-aligned predictions. The audit checked unique IDs, exact denominators, Phase 1 and target labels, final labels, parsing fallback, corrected and introduced errors, accuracy, Macro F1, confusion matrices, class reports, and paired correctness comparisons.

## Phase 1 comparisons

- Reddit 12,000, Llama 3 SELF-DISCOVER: `+0.2833 pp`, exact `p = 0.001533`, Holm `p = 0.015137` within the 12-condition family.
- Mixed Emotion, Llama 3 SELF-DISCOVER: `+9.0000 pp`, exact `p = 1.12e-7`, Holm `p = 1.34e-6`.
- Additional Reddit 9,000, Llama 3 SELF-DISCOVER: `+0.1889 pp`, exact `p = 0.013718`, Holm `p = 0.041155` within the three-protocol family.

## Protocol comparisons

Llama 3 SELF-DISCOVER had the highest observed Reddit accuracy, but its differences from Direct and CoT were not statistically significant in the paired protocol-to-protocol comparisons. On the controlled Mixed Emotion stress test, SELF-DISCOVER was significantly higher than Direct and CoT for both Llama 2 and Llama 3. These statements concern different null hypotheses and are not contradictory.

## Parsing fallback

Unparsed routed responses retain the Phase 1 label. They are not regenerated, manually relabeled, or automatically counted as wrong. The parsing-failure totals are recorded in `row_verified_metrics.csv` and `predictions/manifest.csv`.

## Reproduce

```bash
python3 scripts/reproduce_results.py
python3 scripts/reproduce_statistics.py
python3 -m unittest discover -s tests -v
```
