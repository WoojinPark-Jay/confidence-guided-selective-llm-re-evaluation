# Final prompt set

- `direct/prompt.txt`: one-pass Direct protocol.
- `cot/`: five-turn CoT dialogue plus its text template.
- `self_discover/`: task policy, 18-module bank, SELECT, ADAPT, compact IMPLEMENT, and per-post execution materials.
- `../plans/`: exact cached model-specific plans generated from the SELF-DISCOVER construction stage.

The plan is model-specific but not dataset-specific. Llama 2 reuses its plan for Reddit and Mixed Emotion; Llama 3 does the same with its own plan. The additional 9,000-post evaluation reuses the already frozen Llama 3 plan and performs no new discovery calls.

The saved plans are the unedited model outputs used in the reported runs. In particular, the released Llama 2 plan is retained even where its structure does not fully follow the requested compact format; editing it now would define a different experimental condition.
