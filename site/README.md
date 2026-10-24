# Project page

Static GitHub Pages site for the public reproducibility package.

- Source: `site/`
- Deployment: `.github/workflows/pages.yml`
- Public URL: <https://woojinpark-jay.github.io/confidence-guided-selective-llm-re-evaluation/>

The page uses only public aggregate results and manuscript figures. It does not publish the manuscript PDF, LaTeX source, raw Reddit text, private identifiers, or model weights.

## Results maintenance

Run `python3 scripts/build_site_results.py` after changing the recomputed metrics. This regenerates the 15-condition comparison table data in `site/results-data.js`; deployment checks that the export is current. Bold values identify the highest unrounded accuracy or macro F1 within each dataset/model group, not statistical significance.

## Project-page quality review

The initial dashboard-like presentation was replaced after author feedback. Design references were the researcher-maintained [Nerfies](https://nerfies.github.io/) and [Ref-NeRF](https://dorverbin.github.io/refnerf/) pages, inspected for title/author hierarchy, representative imagery, and straightforward section structure. Their source code, text, and media were not copied.

The full manuscript architecture is now the first figure below the title, authors, and resource links. The page uses a white background, a single reading column, ordinary section headings, full-width figures, and conventional tables. Decorative cards, oversized metric displays, marketing-style headings, numbered sections, the sticky branded menu, and interactive dataset tabs were removed. The 15-condition table remains available in a native disclosure. Figures link directly to their high-resolution originals.

The page distinguishes exploratory and frozen evaluations, explains the non-binding threshold, and connects annotation and generation-workload claims to public source files. No provisional citation or unpublished manuscript PDF is provided. The architecture is reproduced unchanged; its caption explicitly clarifies that the main evaluation sets also informed prompt development.

Checks include architecture rendering at 2,800 pixels, 15 rendered comparison rows, disclosure interaction, mobile document width, local/repository link targets, and repository release validation. The manuscript and experiment results are unchanged.
