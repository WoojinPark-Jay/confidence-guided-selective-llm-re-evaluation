# Project page

Static GitHub Pages site for the public reproducibility package.

Build with `python3 scripts/build_site.py` and serve `build/site/` for release QA. The deploy workflow uploads this output, not the source folder. Styles and all scripts receive content-hashed filenames, preventing new HTML from reusing earlier CSS or JavaScript under unchanged URLs. The HTML includes a readable Direct prompt and fixed-evaluation counts even before scripts initialize.

The October 24 repair also aligns the prompt reader and outcome explorer to the 820px prose width, limits ordinary figures to 960px, retains the wider architecture, and reduces section spacing. It adds plain-language distinctions between instructions and model-generated plans, explains placeholder inputs and task-level reuse, and works through the 30 minus 13 net-correction calculation. All 19 prompt/plan document choices were exercised in the release build, including both saved model plans.

- Source: `site/`
- Deployment: `.github/workflows/pages.yml`
- Public URL: <https://woojinpark-jay.github.io/confidence-guided-selective-llm-re-evaluation/>

The page uses public results, synthetic examples, verified synthetic model responses, and manuscript figures. It does not publish the manuscript PDF, LaTeX source, raw Reddit text, private identifiers, or model weights.

## Algorithm and case walkthrough (October 24)

The header uses the same Korea University logo as the author's [bounded-history-agreement page](https://woojinpark-jay.github.io/bounded-history-agreement/assets/korea-university.png), following confirmation that both named authors are affiliated with the university. This is an affiliation mark, not an endorsement.

The algorithm section separates pre-inference calibration and saved-plan construction from per-post classification, routing, re-evaluation, and label fallback. It does not replace the exact notebook implementation.

The case reader uses `data/mixed_emotion/site_case_records.json`. Four qualitative cases show correction (MEV2_DEP_046), introduced error (MEV2_HAP_003), parsing fallback (MEV2_NEU_004), and an accepted error (MEV2_DEP_001). The first correction in original source order was chosen; the error and fallback are the sole such routed outcomes. The accepted example is the first dataset row. This is not a representative sample or a new evaluation.

The original Mixed Emotion v6c CSV was verified against the September 30 audit SHA-256, `77fdf9430614fb48d0af4f47aee108944b64bc4736925d8923ccb4747e98cb15`. All 86 routed texts, saved plans, Phase 1 predictions/confidences, and final labels (including fallback) were checked against released files before exporting. The earlier non-v6c outputs were not used. Only three synthetic responses are included; the non-routed case has no response. Displayed excerpts are extracted from the actual response, and the complete unedited text remains available in a disclosure. Interpretation text is separate from model text. Intermediate model claims are not presented as verified facts.

Run `python3 scripts/build_site_cases.py` to regenerate the browser data from the public JSON. Initial import additionally accepts `--raw PATH` and requires the exact source hash. The deployment verifies this export and runs the test suite. No visitor text is collected or sent to an API.

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
