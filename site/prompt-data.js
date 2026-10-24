window.studyPrompts = {
  "Direct": [
    {
      "title": "Prompt",
      "path": "prompts/direct/prompt.txt",
      "text": "You are an expert annotator for research-oriented, non-clinical emotion classification.\n\n{policy}\n\nText:\n{text}\n\nThe Phase 1 classifier predicted: {phase1_label}\n\nSelect the final label that best represents the text. Return no rationale and end with exactly one line in this form:\nFinal label: Depression\nor Final label: Neutral\nor Final label: Happy\n"
    },
    {
      "title": "Shared policy",
      "path": "prompts/policy.txt",
      "text": "Classification Policy:\n- Depression: unresolved sadness, hopelessness, emotional distress, emotional exhaustion, withdrawal, self-devaluation, or a clearly negative overall trajectory is dominant.\n- Neutral: the text is mainly factual, routine, balanced, informational, or emotionally mild, without a dominant positive or distress-related state.\n- Happy: happiness, relief, gratitude, accomplishment, fulfillment, or a clearly positive resolution is dominant.\n\nAssess the dominant emotional meaning of the full text. For mixed or shifting emotions, consider the overall trajectory and final takeaway. Do not decide from isolated words, and do not make clinical diagnoses or treatment recommendations.\n"
    }
  ],
  "CoT": [
    {
      "title": "System message",
      "path": "prompts/cot/turn_0.txt",
      "text": "You are an expert annotator for research-oriented, non-clinical emotion classification. Assist in analyzing emotions in text data. Do not make a clinical diagnosis, infer a medical condition, or provide treatment advice.\n"
    },
    {
      "title": "1. Acknowledgment instruction",
      "path": "prompts/cot/turn_1.txt",
      "text": "I will first provide a piece of text. Independently assess its emotional content before comparing it with a Phase 1 AI-generated label. The only permitted labels are Depression, Neutral, and Happy.\n"
    },
    {
      "title": "2. Post text",
      "path": "prompts/cot/text_template.txt",
      "text": "Text:\n{phase2_original_text}\n"
    },
    {
      "title": "3. Independent analysis",
      "path": "prompts/cot/turn_2.txt",
      "text": "Independently analyze the text. State the dominant emotion and textual evidence before considering the Phase 1 label.\n\n{policy}\n\nUse only Depression, Neutral, or Happy for your provisional label.\n"
    },
    {
      "title": "4. Phase 1 comparison",
      "path": "prompts/cot/turn_3.txt",
      "text": "The Phase 1 classifier predicted: {phase1_label}\n\nCompare that prediction with your independent assessment. Confirm it only when it is supported by the dominant emotional meaning of the full text. Otherwise, explain the correction using textual evidence only.\n"
    },
    {
      "title": "5. Final decision",
      "path": "prompts/cot/turn_4.txt",
      "text": "Provide the final Phase 2 decision. Use only one exact label: Depression, Neutral, or Happy. Do not use synonyms or additional labels. End the response with exactly one line: Final label: [label]\n"
    },
    {
      "title": "Shared policy",
      "path": "prompts/policy.txt",
      "text": "Classification Policy:\n- Depression: unresolved sadness, hopelessness, emotional distress, emotional exhaustion, withdrawal, self-devaluation, or a clearly negative overall trajectory is dominant.\n- Neutral: the text is mainly factual, routine, balanced, informational, or emotionally mild, without a dominant positive or distress-related state.\n- Happy: happiness, relief, gratitude, accomplishment, fulfillment, or a clearly positive resolution is dominant.\n\nAssess the dominant emotional meaning of the full text. For mixed or shifting emotions, consider the overall trajectory and final takeaway. Do not decide from isolated words, and do not make clinical diagnoses or treatment recommendations.\n"
    }
  ],
  "SELF-DISCOVER": [
    {
      "title": "Per-post execution",
      "path": "prompts/self_discover/execute.txt",
      "text": "Annotate one social-media post for a research-oriented, non-clinical emotion study.\n\n{policy}\n\nReasoning structure to follow:\n{structure}\n\nPost:\n<post>\n{text}\n</post>\n\nWork through the reasoning structure on this post. For every step, quote the exact words from the\npost that your finding rests on. Do not decide the label before the final step.\n\nTime frame and whose state it is. Before weighing anything, establish two things and quote the\nevidence for each:\n- Is the emotional state the writer reports about their present, or about a past they are describing\n  from a changed position?\n- Is it the writer's own state, or a state they attribute to someone else, to a quotation, or to a\n  hypothetical?\nThese cut in every direction. A post can describe severe hardship and still be Happy when the writer\npresents it as past and resolved. A post can be light or matter-of-fact in tone and still be\nDepression when the distress is present and unresolved. A post can recount someone else's crisis\nwhile the writer is composed, which is Neutral.\n\nEvidence ledger. Search just as hard for each of the three labels; do not give a shorter treatment to\nthe ones you find less likely.\n\nDepression - strongest supporting quote: \"...\" | strongest quote against: \"...\"\nNeutral - strongest supporting quote: \"...\" | strongest quote against: \"...\"\nHappy - strongest supporting quote: \"...\" | strongest quote against: \"...\"\n\nCounterfactual check. Name your second-best label. State what would have to appear in this post for\nthat label to be correct instead, then say whether the post contains it.\n\nThen end with exactly one line, in this form:\nFinal label: Depression\nor Final label: Neutral\nor Final label: Happy\n"
    },
    {
      "title": "System message",
      "path": "prompts/self_discover/system.txt",
      "text": "You are an expert annotator for research-oriented, non-clinical emotion classification. Do not provide clinical diagnosis, medical inference, treatment advice, or professional mental health advice.\n"
    },
    {
      "title": "Task specification",
      "path": "prompts/self_discover/task.txt",
      "text": "Task: research-oriented, non-clinical emotion annotation of English social-media posts.\n\nEach instance is one post, consisting of a title and a body, written by a single author. An annotator\nmust assign exactly one label from Depression, Neutral, Happy, according to the following policy.\n\n{policy}\n\nThe posts are real, user-written text. They vary greatly in length. A single post may cover several\ntopics, quote or paraphrase other people, ask a question, give advice, report factual information,\ndescribe a past episode that has since resolved, or mix positive and negative cues within the same\nparagraph. The annotator must decide the dominant emotional meaning of the post as a whole, and must\nbe able to point to the text that supports the decision.\n\nNo clinical diagnosis, medical inference, or treatment advice is produced. The output is a research\nannotation label only.\n"
    },
    {
      "title": "18 reasoning modules",
      "path": "prompts/self_discover/modules.txt",
      "text": "1 Separate the writer's own current emotional state from emotions they attribute to other people, to quoted text, or to hypothetical situations.\n2 Locate the emotional stance the post opens with and the emotional stance it closes with, and state explicitly whether they differ.\n3 Determine the final emotional takeaway the writer leaves the reader with, instead of averaging every emotional word in the post.\n4 Distinguish a past state the writer describes as changed or resolved from a state that is still ongoing at the time of writing.\n5 Decide whether the post is primarily informational, procedural, advice-giving, or a question about a topic, rather than an expression of the writer's own current feelings.\n6 Check for irony, sarcasm, dark humour, or understatement that inverts the literal sentiment of a phrase.\n7 Weigh explicit emotional statements against implicit signals such as sleep, appetite, isolation, disrupted routine, or loss of interest.\n8 Identify markers of resolution: relief, gratitude, recovery, accomplishment, reconnection, or a plan the writer feels good about.\n9 Identify markers of unresolved distress: hopelessness, exhaustion, self-devaluation, numbness, withdrawal, or an appeal for help that the post never resolves.\n10 Judge emotional intensity, separating strong affect from mild, passing, or conventional affect.\n11 Check whether the post seeks support or asks a question, and whether the surrounding text is distressed or matter-of-fact about it.\n12 Separate discussing mental health as a subject, or reporting facts about it, from the writer expressing their own mental state.\n13 For long or multi-topic posts, identify which segment carries the writer's main point and weight that segment above digressions.\n14 Rank all three candidate labels for this post and name which label is second-best, rather than stopping at the first label that seems to fit.\n15 State the single strongest piece of textual evidence for each of the three labels before choosing between them.\n16 Test the leading label by asking what would have to appear in the text for a different label to be correct, then check whether it appears.\n17 Check whether the tone is measured and observational rather than emotionally invested, which can occur even when the subject matter is heavy.\n18 Check whether apparent positivity is aspirational, hypothetical, conventional politeness, or directed at someone else, rather than reflecting the writer's own current state.\n"
    },
    {
      "title": "SELECT",
      "path": "prompts/self_discover/select.txt",
      "text": "In order to solve the given task:\n<Task>\n{Task}\n</Task>\nSelect several modules that are crucial for solving the tasks above\nfrom all the reasoning module description given below:\n{resonining_modules}\n"
    },
    {
      "title": "ADAPT",
      "path": "prompts/self_discover/adapt.txt",
      "text": "Rephrase and specify each reasoning module so that it better helps solving the task:\n<Task>\n{Task}\n</Task>\nSELECTED module descriptions:\n{selected_modules}\nAdapt each reasoning module description to better solve the task:\n"
    },
    {
      "title": "IMPLEMENT",
      "path": "prompts/self_discover/implement_compact.txt",
      "text": "Operationalize the reasoning modules into a step-by-step reasoning plan in JSON format.\n\n<Task>\n{Task}\n</Task>\n\nADAPTED module descriptions:\n{adapted_modules}\n\nImplement a reasoning structure that generalises to every instance of this task.\n\nThe plan must obey these constraints. They exist because a plan that violates them throws away\nevidence before it can be used, or is too long to be carried out:\n\n1. **At most three steps.** Merge related checks rather than listing them separately.\n2. **Each step is one line.** A name and a single sentence, nothing more. No nested fields, no\n   examples, no restating of the instructions.\n3. Every step takes the full original post as its input. A step may refer to an earlier step's\n   finding, but it must re-read the post rather than work only from an earlier summary.\n4. No step before the final one may name, choose, rank or imply the answer.\n5. The final step is the only one that weighs the gathered evidence and selects a single label.\n\nReturn only the JSON plan.\n"
    },
    {
      "title": "Shared policy",
      "path": "prompts/policy.txt",
      "text": "Classification Policy:\n- Depression: unresolved sadness, hopelessness, emotional distress, emotional exhaustion, withdrawal, self-devaluation, or a clearly negative overall trajectory is dominant.\n- Neutral: the text is mainly factual, routine, balanced, informational, or emotionally mild, without a dominant positive or distress-related state.\n- Happy: happiness, relief, gratitude, accomplishment, fulfillment, or a clearly positive resolution is dominant.\n\nAssess the dominant emotional meaning of the full text. For mixed or shifting emotions, consider the overall trajectory and final takeaway. Do not decide from isolated words, and do not make clinical diagnoses or treatment recommendations.\n"
    }
  ],
  "Saved plans": [
    {
      "title": "Llama 3",
      "path": "plans/llama3_plan.txt",
      "text": "Here is the operationalized reasoning plan in JSON format:\n\n```\n{\n  \"steps\": [\n    {\n      \"name\": \"Emotion Extraction\",\n      \"sentence\": \"Extract the writer's explicit and implicit emotional expressions, distinguishing between their own emotions and those attributed to others, quoted text, or hypothetical situations.\"\n    },\n    {\n      \"name\": \"Emotional Arc and Essence\",\n      \"sentence\": \"Analyze the emotional trajectory of the post, identifying the emotional stance at the beginning and end, and determine the dominant emotional takeaway the writer intends to convey.\"\n    },\n    {\n      \"name\": \"Contextual Clarification and Purpose Identification\",\n      \"sentence\": \"Disentangle past events or experiences from the writer's current emotional state, identify the primary purpose of the post, and consider the implications for their emotional expression.\"\n    }\n  ],\n  \"final_step\": {\n    \"name\": \"Label Prioritization\",\n    \"sentence\": \"Rank the three candidate labels (Depression, Neutral, Happy) in order of likelihood, considering the emotional essence, emotional arc, and contextual factors, and provide a second-best label to ensure the annotation is robust and defensible.\"\n  }\n}\n```\n\nThis plan consists of three main steps that extract the writer's emotional expressions, analyze the emotional trajectory and essence, and clarify the context and purpose of the post. The final step prioritizes the candidate labels based on the gathered evidence.\n"
    },
    {
      "title": "Llama 2",
      "path": "plans/llama2_plan.txt",
      "text": "Here is a step-by-step reasoning plan in JSON format to annotate the emotional meaning of English social-media posts:\n\nStep 1: Separate the writer's own emotions from those of others (input: full post)\n\n* Identify emotional language used in the post (e.g. \"I feel\", \"they feel\", \"it seems\")\n* Determine whether the language refers to the writer's own emotions or someone else's\n* Assign a label based on the identified emotional language (e.g. \"Depression\" if the language refers to the writer's own emotions, \"Neutral\" if it refers to someone else's emotions)\n\nStep 2: Locate the emotional stance the post opens with and the emotional stance it closes with (input: full post)\n\n* Identify the opening and closing sentences of the post\n* Determine whether the emotional stance of the opening sentence differs from the emotional stance of the closing sentence\n* Assign a label based on the identified emotional stance (e.g. \"Depression\" if the stance differs, \"Neutral\" if the stance is the same)\n\nStep 3: Determine the final emotional takeaway the writer leaves the reader with (input: full post)\n\n* Identify the concluding sentence of the post\n* Determine whether the concluding sentence reflects a positive, negative, or neutral emotional state\n* Assign a label based on the identified emotional takeaway (e.g. \"Happy\" if the takeaway is positive, \"Neutral\" if it is neutral, \"Depression\" if it is negative)\n\nStep 4 (final step): Weigh the gathered evidence and select a label (input: full post)\n\n* Review the labels assigned in steps 1-3\n* Select the label that best reflects the dominant emotional meaning of the post\n* Output the selected label as the research annotation label.\n\nNote: These steps are designed to be carried out in sequence, with each step building on the previous one to gather more information and refine the annotation. The final step is the only one that assigns a label to the post, based on the gathered evidence.\n"
    }
  ]
};
