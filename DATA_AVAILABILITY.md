# Data availability

## Included

- The 300-example synthetic Mixed Emotion stress test.
- Text-free, row-aligned `example_id`, target, Phase 1, and final labels for all reported conditions.
- Aggregate metrics, class reports, confusion matrices, paired-test results, and workload summaries.
- Data and model hashes required to identify the exact private artifacts used.

## Not included in Git

Raw Reddit text and LLM free-form responses are excluded because they may reproduce user-authored content. The 1.4 GB source table and fine-tuned model weights are also excluded because of size and distribution constraints. Their file hashes and required schemas are recorded under `data/manifests/`, `models/`, and `provenance/`.

The text-free prediction files are sufficient to reproduce every reported end-to-end accuracy, Macro F1, confusion matrix, corrected/introduced count, exact McNemar p-value, and Holm-adjusted p-value.

This public repository releases the reconstruction code, manifests, synthetic stress test, and text-free evaluation records. It does not currently provide access to the restricted Reddit-derived artifacts or model weights. If an approved controlled-access route is established, its terms and location will be documented here and in the paper.

No placeholder URL in this repository should be interpreted as an active data-access commitment.
