# Released result evidence

## `predictions/`

Each CSV contains exactly four columns:

```text
example_id,target_label,phase1_label,final_label
```

No Reddit text, prompt, free-form response, or model rationale is present. `manifest.csv` records the dataset, model, protocol, denominator, routed count, parsing failures, expected metrics, and source hashes.

## `reports/`

- `row_verified_metrics.csv`: canonical metrics for all 15 final conditions.
- `phase1_paired_statistics.csv`: each Phase 2 condition versus Phase 1.
- `sd_vs_baselines_paired_statistics.csv`: SELF-DISCOVER versus Direct and CoT on the same rows.
- condition-specific confusion matrices and class reports.
- `additional9000_audit_evidence.json`: row/call verification evidence for the separate 9,000-post evaluation.

Run `python3 scripts/reproduce_results.py` to independently recompute the point metrics from the released prediction files.

