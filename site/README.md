# Project page

Static GitHub Pages site for the public reproducibility package.

- Source: `site/`
- Deployment: `.github/workflows/pages.yml`
- Public URL: <https://woojinpark-jay.github.io/confidence-guided-selective-llm-re-evaluation/>

The page uses only public aggregate results and manuscript figures. It does not publish the manuscript PDF, LaTeX source, raw Reddit text, private identifiers, or model weights.

## Results maintenance

Run `python3 scripts/build_site_results.py` after changing the recomputed metrics. This regenerates the 15-condition comparison table data in `site/results-data.js`; deployment checks that the export is current. Bold values identify the highest unrounded accuracy or macro F1 within each dataset/model group, not statistical significance.

The same command exports `site/prompt-data.js` from the public `prompts/` and `plans/` files. The reader preserves literal template text and placeholders. It separates researcher-authored prompts from unedited model-generated task-level plans. There is no live inference or transmission of visitor input.

The outcome explorer uses all 15 released configurations and computes percentage-point gains as `100 * (corrected - introduced) / n`. It defaults to the fixed additional evaluation, supports both models where evaluated, and does not invent a Llama 2 additional-evaluation result. It shows negative as well as positive net corrections. Bar scales are shared within each selected comparison, not across datasets.

Typography uses local Times-family serif fonts for a traditional research-document appearance and monospace for exact prompt text. The SELF-DISCOVER diagram is limited to 850px, while the full architecture retains the wider figure area. A compact section index links to the method, prompt reader, results, and materials. These additions address the deeper method inspection and evidence navigation available in the author's bounded-history-agreement and pec-news-audit pages without restoring decorative metric cards.

## Project-page quality review

The initial dashboard-like presentation was replaced after author feedback. Design references were the researcher-maintained [Nerfies](https://nerfies.github.io/) and [Ref-NeRF](https://dorverbin.github.io/refnerf/) pages, inspected for title/author hierarchy, representative imagery, and straightforward section structure. Their source code, text, and media were not copied.

The full manuscript architecture is now the first figure below the title, authors, and resource links. The page uses a white background, a single reading column, ordinary section headings, full-width figures, and conventional tables. Decorative cards, oversized metric displays, marketing-style headings, numbered sections, the sticky branded menu, and interactive dataset tabs were removed. The 15-condition table remains available in a native disclosure. Figures link directly to their high-resolution originals.

The page distinguishes exploratory and frozen evaluations, explains the non-binding threshold, and connects annotation and generation-workload claims to public source files. No provisional citation or unpublished manuscript PDF is provided. The architecture is reproduced unchanged; its caption explicitly clarifies that the main evaluation sets also informed prompt development.

Checks include architecture rendering at 2,800 pixels, 15 rendered comparison rows, disclosure interaction, mobile document width, local/repository link targets, and repository release validation. The manuscript and experiment results are unchanged.
