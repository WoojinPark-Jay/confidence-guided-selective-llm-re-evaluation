# Reproducibility guide

## Two distinct reproduction levels

### Level 1: result verification

This is fast and requires no GPU, model weights, or Reddit text. The files in `results/predictions/` contain only aligned IDs and labels. Run:

```bash
python3 scripts/reproduce_results.py
python3 scripts/reproduce_statistics.py
```

The first script checks the full denominator for each condition and recomputes accuracy, Macro F1, corrected errors, introduced errors, net corrections, confusion matrices, and class reports. The second recomputes the exact McNemar and Holm-adjusted paired comparisons from the same row-aligned predictions.

### Level 2: complete model rerun

This requires the restricted input tables, the final DistilBERT weights, access to the two Hugging Face Llama repositories, and a CUDA GPU. Follow the numbered Colab notebooks. A strict rerun must satisfy the following contracts before generation:

- expected total and routed row counts;
- routed-ID SHA-256;
- model file hashes and model revisions;
- temperature and routing threshold;
- model-specific cached SELF-DISCOVER plan;
- generation cap, decoding, quantization, and fallback rule.

## Phase 1

The original corpus is sampled to 40,000 rows per class and split within each class into 70% training, 10% validation, 10% calibration, and 10% held-out test. Hyperparameters are selected on validation Macro F1. The final seed-42 model is then used operationally. Temperature is fit on the separate calibration split by minimizing calibration NLL. The threshold is selected on that same calibration split by maximizing accepted coverage among candidates satisfying the prespecified one-sided risk-bound rule.

Do not fit temperature or select the threshold on either held-out evaluation set.

## Phase 2

Only rows with calibrated confidence below `0.70` are routed. Phase 2 receives minimally sanitized original title and body text. The cleaned Phase 1 model input must not be substituted for this field.

Direct, CoT, and SELF-DISCOVER operate on the same routed IDs within a dataset. SELF-DISCOVER performs SELECT, ADAPT, and IMPLEMENT once per model to create a model-specific task-level plan. That plan is cached and reused for every routed post in both the Reddit and Mixed Emotion evaluations. Each post still receives a fresh execution response.

If the final label cannot be parsed unambiguously, the Phase 1 prediction is retained. A failed parse is not regenerated and is not automatically counted as an error unless the retained Phase 1 label is itself wrong.

## Additional 9,000-post evaluation

The separate 9,000-post evaluation was held out from the reported 120,000-post development sample. The final seed-42 weights, temperature, threshold, Llama 3 prompts, and saved Llama 3 SELF-DISCOVER plan were frozen before this set was evaluated for the final pipeline. It performs no training, hyperparameter selection, calibration fitting, threshold search, prompt adjustment, or plan discovery.

The set comes from the same source corpus and is disjoint under the recorded normalized exact-text rule. It is not claimed to be author-disjoint, temporally disjoint, or an external-domain benchmark.

## Numerical comparison

End-to-end evaluation always recombines accepted Phase 1 labels and routed Phase 2 labels over the complete dataset. `corrected` counts Phase 1 errors made correct by Phase 2; `introduced` counts correct Phase 1 labels made wrong by Phase 2. Net corrections equal `corrected - introduced`.

Paired accuracy comparisons use the two-sided exact McNemar test on discordant correctness pairs. Holm adjustment is applied within the comparison family declared in the released statistics table.
