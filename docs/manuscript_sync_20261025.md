# Manuscript synchronization: 2026-10-25

This note records correspondence with collaborator manuscript commit
`6618165c4a53c572443eff6bd28a96a498350a38` (collaborator review repository,
branch `codex/checkpoint-20260903`). It is a documentation checkpoint, not
a new experimental release or an author-approved submission version.

## Manuscript changes

- Defined LLM, CoT, SVM, LSTM, CNN, TF-IDF, and BiLSTM at their first uses in the main text.
- Replaced the introductory transition "To address this gap" with "To address this need".
- Clarified in contribution 4 that the main Reddit and Mixed Emotion evaluations informed Phase 2 prompt development, followed by the separate fixed-protocol 9,000-post evaluation. This scope is already stated in the public README.
- Replaced "harmful" for Llama 2 CoT on Mixed Emotion with the observed net loss of 14 correct predictions and its non-significant Holm-adjusted comparison with Phase 1 (p = 0.3520). The existing public statistics remain unchanged.
- Reworded the data-partition sentence to avoid excessive word spacing. The split remains 84,000 training posts and 12,000 each for validation, calibration, and testing.

## Unchanged public artifacts

### Follow-up: manuscript v2

Collaborator commit `2521f56` versions the PDF and Overleaf ZIP as
`2026_10_25_v2`, preserving the earlier files. The final Index Terms are:
Chain-of-thought, confidence-guided routing, emotion classification,
large language models, mental health natural language processing,
model cascades, probability calibration, SELF-DISCOVER, social media text analysis.
This keyword-only update orders the nine terms alphabetically and does not
change the experimental artifacts or create a public release tag.

No experiments, code, datasets, predictions, metrics, statistical tests,
prompts, saved plans, or model settings changed in this synchronization.
The manuscript PDF and Overleaf ZIP remain in the collaborator repository;
neither is added to this public repository.

A manuscript-linked release tag remains pending final author approval.
This documentation update does not create a release tag or archival DOI.
