# Data layout

## Mixed Emotion

`mixed_emotion/mixed_emotion_stress_test_300.csv` is the final 300-example synthetic stress test used by the released pipeline. It is balanced across Depression, Neutral, and Happy proxy labels and was excluded from Phase 1 training, model validation, calibration, and threshold selection.

## Reddit evaluations

The Reddit source corpus and routed original text are intentionally absent. To run the notebooks, provide a Phase 1 table with the schema below:

| Column | Meaning |
|---|---|
| `example_id` | Stable non-text row key |
| `target_label` | One of Depression, Neutral, Happy |
| `phase1_label` | Frozen Phase 1 prediction |
| `phase1_confidence` | Temperature-scaled maximum softmax probability |
| `phase1_routed` | True when confidence is below 0.70 |
| `phase2_original_text` | Minimally sanitized original title and body, populated for routed rows |

Do not map a cleaned Phase 1 `text` column to `phase2_original_text`. The model stages intentionally use different input representations: normalized text for efficient Phase 1 classification and minimally sanitized original text for contextual Phase 2 re-evaluation.

`manifests/restricted_artifacts.json` records exact hashes and row-count contracts without exposing post text.

## Supplying restricted artifacts

The release notebooks never contain account names, shared-link URLs, or private Drive file IDs.

- Notebook 01 reads the authorized source table from `PRIMARY_DATA_PATH`, or from an explicitly supplied `CGSLR_PRIMARY_DATA_URL`.
- Notebook 08 reads the routed Reddit Phase 2 export from its documented Drive path. An authorized URL is optional through `CGSLR_PHASE1_INPUT_URL` after changing the dataset contract from `drive` to `url`.
- Notebook 09 first reuses a verified extracted bundle already present in Drive. If it must retrieve the three-part restricted bundle, provide `CGSLR_ASSET_PART1_FILE_ID`, `CGSLR_ASSET_PART2_FILE_ID`, and `CGSLR_ASSET_PART3_FILE_ID` as Colab Secrets or environment variables.

Every restricted artifact is checked against `manifests/restricted_artifacts.json` or the hash-pinned notebook contract before use. A hash mismatch stops execution; substituting a similarly named checkpoint or dataset is not permitted for strict replication.
