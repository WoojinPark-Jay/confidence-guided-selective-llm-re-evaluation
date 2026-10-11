# Final Colab notebooks

The notebooks are numbered in recommended execution order. Outputs and execution counts are stripped from the release copies.

| Notebook | Final role |
|---|---|
| `01_phase1_training_calibration_routing.ipynb` | DistilBERT training, calibration, threshold selection, and Phase 1 exports |
| `02_reddit_llama2_direct.ipynb` | Reddit Llama 2 Direct only |
| `03_reddit_llama2_cot.ipynb` | Reddit Llama 2 CoT with 1,024-token call budget |
| `04_reddit_llama3_direct_cot.ipynb` | Reddit Llama 3 Direct and CoT only |
| `05_mixed_emotion_llama2_direct.ipynb` | Mixed Emotion Llama 2 Direct only |
| `06_mixed_emotion_llama2_cot.ipynb` | Mixed Emotion Llama 2 CoT with 1,024-token call budget |
| `07_mixed_emotion_llama3_direct_cot.ipynb` | Mixed Emotion Llama 3 Direct and CoT only |
| `08_self_discover_v6c_final.ipynb` | Final v6c SELF-DISCOVER for either model and either main dataset |
| `09_additional9000_phase1.ipynb` | Frozen Phase 1 evaluation on the separate 9,000 posts |
| `10_additional9000_llama3_final.ipynb` | Llama 3 Direct, CoT, and frozen v6c on the separate 9,000 posts |

Each release notebook is restricted to the final condition named above. The reported SELF-DISCOVER condition must be run only through notebook 08 or the frozen 9,000-post notebook 10.

For strict replication, do not change model revisions, routing IDs, cached plans, prompt text, token limits, decoding mode, or fallback behavior.

## Release hygiene and data boundaries

- All notebook documentation and code comments are in English.
- Cell outputs, execution counts, browser-local metadata, account identifiers, credentials, and private Drive file IDs are removed.
- No Reddit title, post body, or post-linked generation is embedded in a notebook. Restricted Reddit inputs are supplied by the authorized researcher at runtime and remain outside this repository.
- The Mixed Emotion text is intentionally public because it is synthetic. Notebooks 05--08 obtain it from `data/mixed_emotion/mixed_emotion_stress_test_300.csv` and join it to the text-free Phase 1 artifact `data/mixed_emotion/mixed_emotion_phase1_outputs.csv`; both files are verified by SHA-256 before use.
- Prompt templates and saved SELF-DISCOVER plans are intentionally visible because they define the reported methods. A row-specific model request is assembled only at runtime from the authorized input.
- Runtime result files can contain restricted post text inside request logs and can contain raw model responses. Keep those files in the private output location used by the notebooks; do not commit or redistribute them. Only the de-identified aggregate and prediction artifacts documented elsewhere in this repository belong in the public release.

The release validator rejects notebook outputs, execution counts, Hangul documentation, opaque embedded data blobs, browser-local output metadata, and credential-like strings.
