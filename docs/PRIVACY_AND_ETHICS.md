# Privacy, ethics, and intended use

This repository supports research on selective text-classification systems. It does not provide a clinical diagnostic system and must not be used for automated mental-health decisions about individuals.

The public package excludes raw Reddit text, usernames, URLs, and free-form LLM responses linked to Reddit examples. Stable study-local IDs are retained only to support paired evaluation. The synthetic stress-test text is included because it was created for this study and contains no real user posts.

The Reddit analysis is retrospective and uses archived, publicly accessible posts. The researchers did not recruit, contact, intervene with, or attempt to identify Reddit users. The released prediction records are text-free, and no username, profile URL, or verbatim Reddit post is redistributed. The applicable institutional-review status must be confirmed by the authors before submission; this repository does not assert an approval or exemption number.

The Mixed Emotion annotation audit releases only anonymized annotator labels and confidence ratings. Annotator names and workspace identifiers are not included. The audit assessed consistency with the study's non-clinical label policy and is not clinical-expert validation.

Anyone reconstructing the private inputs is responsible for complying with the source platform's terms, institutional requirements, and applicable privacy rules. Results should be interpreted as performance on proxy emotion labels, not prevalence estimates or clinical validity.
