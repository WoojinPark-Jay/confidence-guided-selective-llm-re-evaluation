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

The source notebooks for Direct and CoT originally contained shared helper definitions for other methods. Their release configuration is narrowed to the methods named above. The reported SELF-DISCOVER condition must be run only through notebook 08 or the frozen 9,000-post notebook 10.

For strict replication, do not change model revisions, routing IDs, cached plans, prompt text, token limits, decoding mode, or fallback behavior.

