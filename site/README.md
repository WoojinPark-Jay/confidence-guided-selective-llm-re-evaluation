# Project page

Static GitHub Pages site for the public reproducibility package.

- Source: `site/`
- Deployment: `.github/workflows/pages.yml`
- Public URL: <https://woojinpark-jay.github.io/confidence-guided-selective-llm-re-evaluation/>

The page uses only public aggregate results and manuscript figures. It does not publish the manuscript PDF, LaTeX source, raw Reddit text, private identifiers, or model weights.

## Results maintenance

Run `python3 scripts/build_site_results.py` after changing the recomputed metrics. This regenerates the 15-condition comparison table data in `site/results-data.js`; deployment checks that the export is current. Bold values identify the highest unrounded accuracy or macro F1 within each dataset/model group, not statistical significance.

## Project-page quality review

Compared against the author's bounded-history-agreement and pec-news-audit project pages. The revision tightens the title and result hierarchy, brings frozen-protocol evidence forward, gives each multi-panel figure full content width, and adds the actual task-level planning diagram with links to prompts and saved plans. It distinguishes exploratory and frozen evaluations, explains the non-binding threshold, and connects annotation and generation-workload claims to public source files. The provisional BibTeX was removed until the bibliographic record is final.

Checks include dataset-tab switching, the 15 rendered comparison rows, figure expansion, mobile document width, and repository release validation. The manuscript and experiment results are unchanged.
