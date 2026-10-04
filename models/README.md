# Model artifacts

Model weights are not stored in Git.

## Phase 1 DistilBERT

The final operational model is the selected seed-42 DistilBERT model. It is not an intermediate checkpoint and no new training occurs in the export or additional-9,000 notebooks.

Expected files and SHA-256 values:

| File | SHA-256 |
|---|---|
| `config.json` | `b0d6bfc8cb80089a4df54ddaf13fb1b726ca09f5f28536f793d56afdab708858` |
| `model.safetensors` | `0eeb8b16aef6a5df3045c2924d4701305f0ca08dc85d8a66efc3daff33b253d6` |
| `tokenizer.json` | `8b79639ec74b46604e730f505186eaafb1006d2fd00f2c4930d168bb7f894680` |
| `tokenizer_config.json` | `e1c2a61a99bda00f6c55303a210b30e2f92dcf8b555e215812e2eb583e177ffd` |

## Phase 2 LLMs

- `NousResearch/Llama-2-7b-chat-hf`, revision `351844e75ed0bcbbe3f10671b3c808d2b83894ee`
- `NousResearch/Meta-Llama-3-8B-Instruct`, revision `53346005fb0ef11d3b6a83b12c895cca40156b6c`

The notebooks load these models in 4-bit NF4 with double quantization and fp16 compute. Access is governed by the model repositories' own licenses and terms.

