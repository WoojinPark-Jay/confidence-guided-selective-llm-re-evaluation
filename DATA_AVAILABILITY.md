# Data availability

## Included

- The 300-example synthetic Mixed Emotion stress test.
- Text-free, row-aligned `example_id`, target, Phase 1, and final labels for all reported conditions.
- Aggregate metrics, class reports, confusion matrices, paired-test results, and workload summaries.
- Data and model hashes required to identify the exact private artifacts used.

## Not included in Git

Raw Reddit text and LLM free-form responses are excluded because they may reproduce user-authored content. The 1.4 GB source table and fine-tuned model weights are also excluded because of size and distribution constraints. Their file hashes and required schemas are recorded under `data/manifests/`, `models/`, and `provenance/`.

The text-free prediction files are sufficient to reproduce every reported end-to-end accuracy, Macro F1, confusion matrix, corrected/introduced count, exact McNemar p-value, and Holm-adjusted p-value.

Before public release, the authors must select one of these access routes and state it in the paper:

1. deposit restricted artifacts in an approved research repository;
2. provide a request-based access process consistent with the source platform's terms;
3. release only the reconstruction code and manifests when redistribution is not permitted.

No placeholder URL in this repository should be interpreted as an active data-access commitment.

