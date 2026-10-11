# Method overview

## Phase 1: classify, calibrate, and route

DistilBERT is trained on normalized title and self-text. Hyperparameters are chosen on the model-validation split. A distinct calibration split is then used to fit one scalar temperature by minimizing negative log-likelihood. Temperature scaling changes probability sharpness but not the predicted class.

For each evaluation post, calibrated confidence is the maximum temperature-scaled class probability. Posts with confidence at least `0.70` are accepted in Phase 1; posts below `0.70` are routed. The threshold was selected on calibration data by maximizing coverage among candidates whose one-sided accepted-error upper bound was at most 5%, with at least 1,200 accepted calibration examples.

The 1,200-example minimum applies only to threshold selection on the 12,000-example calibration split. It does not apply to the 300-example Mixed Emotion set, which is used only after the routing policy has been frozen.

At the selected threshold of `0.70`, the calibration accepted-set upper risk was 2.162%, below the 5% constraint. The risk constraint was therefore non-binding at the lower boundary of the prespecified `0.70-1.00` grid. Threshold `0.70` was selected because it provided the greatest coverage among the evaluated feasible candidates; it is grid-floor-bound within the tested range and is not presented as an unconstrained optimum.

## Phase 2: selective re-evaluation

Routed cases are re-evaluated using minimally sanitized original text so that sentence boundaries, speaker attribution, temporal shifts, and the emotional trajectory remain available. The target label is never included in an inference prompt.

### Direct

One prompt asks the LLM to assign one of the three labels under the shared class policy.

### CoT

A fixed multi-turn dialogue elicits acknowledgement, text analysis, an independent judgment, a comparison, and a final label. Each stage uses the same published prompt template and token budget for the corresponding model.

### SELF-DISCOVER v6c

SELECT chooses relevant checks from an 18-module emotion-oriented bank. ADAPT specializes them to the annotation task. IMPLEMENT requests a compact model-specific plan of at most three steps. These three calls happen at task level, without an evaluation post or target label. The resulting model output is cached without post-editing; the released Llama 2 output does not fully follow the requested compact structure.

For every routed post, the model receives its cached plan, the shared class policy, fixed evidence checks, and the post text. It generates a fresh evidence-based analysis and exactly one final label. Llama 2 and Llama 3 retain separate plans; each model's plan is reused across Reddit and Mixed Emotion.

## Recombination

Accepted posts retain their Phase 1 label. Routed posts use a parsed Phase 2 label. If parsing fails, they retain the Phase 1 label. Metrics are computed after recombining both groups over all rows, so a method is credited for corrections and penalized for newly introduced errors.

## Mixed Emotion annotation audit

Two research annotators who did not participate in dataset generation or Phase 2 prompt development independently labeled all 300 synthetic examples. Original targets, generation metadata, model outputs, and the other annotator's responses were withheld. Initial labels agreed on 277/300 examples (92.33%; unweighted Cohen's kappa 0.8847). No adjudication or target modification followed the audit. The released case-level file contains anonymized labels and confidence ratings, and `scripts/reproduce_annotation_audit.py` regenerates the reported reliability statistics.
