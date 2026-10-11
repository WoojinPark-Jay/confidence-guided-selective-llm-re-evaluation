#!/usr/bin/env python3
"""Fail closed on missing files, sensitive columns, path leaks, or checksum drift."""

from __future__ import annotations

import csv
import ast
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ALLOWED_PREDICTION_COLUMNS = {"example_id", "target_label", "phase1_label", "final_label"}
FORBIDDEN_COLUMN_PARTS = {"text", "prompt", "response", "answer", "reasoning", "selftext", "title"}
FORBIDDEN_TEXT_PATTERNS = (
    re.compile(r"/Users/[^/]+/"),
    re.compile(r"/home/[^/]+/"),
    re.compile(r"[A-Za-z]:\\\\Users\\\\[^\\\\]+\\\\"),
    re.compile(r"(?:hf|sk)-[A-Za-z0-9_-]{16,}"),
    re.compile(r"gh[pousr]_[A-Za-z0-9]{20,}"),
    re.compile(r"AKIA[0-9A-Z]{16}"),
    re.compile(r"xox[baprs]-[A-Za-z0-9-]{10,}"),
    re.compile(r"AIza[0-9A-Za-z_-]{30,}"),
    re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    re.compile(r"drive\.google\.com/(?:file/d/|open\?id=)", re.I),
    re.compile(r"https?://(?:www\.)?reddit\.com/(?:r|u|user)/", re.I),
    re.compile(r"jay\.seizethemoment", re.I),
    re.compile(r"Branden-Kang"),
    re.compile(r"confidence-guided-llm-reasoning-depression-risk-emotion"),
)
MIXED_PHASE1_COLUMNS = {
    "example_id",
    "target_label",
    "phase1_label",
    "phase1_confidence",
    "phase1_routed",
}
ANNOTATION_AUDIT_COLUMNS = {
    "example_id",
    "target_label",
    "annotator_a_label",
    "annotator_a_confidence",
    "annotator_b_label",
    "annotator_b_confidence",
    "agreement",
}
LABELS = {"Depression", "Neutral", "Happy"}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def notebook_literal_assignments(path: Path) -> dict[str, object]:
    notebook = json.loads(path.read_text(encoding="utf-8"))
    assignments: dict[str, object] = {}
    for cell in notebook.get("cells", []):
        if cell.get("cell_type") != "code":
            continue
        source = "".join(cell.get("source", []))
        source = "\n".join(
            line for line in source.splitlines()
            if not line.lstrip().startswith(("%", "!"))
        )
        tree = ast.parse(source)
        for node in tree.body:
            if not isinstance(node, ast.Assign):
                continue
            try:
                value = ast.literal_eval(node.value)
            except (ValueError, TypeError):
                continue
            for target in node.targets:
                if isinstance(target, ast.Name):
                    assignments[target.id] = value
    return assignments


def validate_predictions() -> None:
    manifest = ROOT / "results" / "predictions" / "manifest.csv"
    with manifest.open(newline="", encoding="utf-8") as handle:
        entries = list(csv.DictReader(handle))
    if len(entries) != 15:
        raise AssertionError(f"expected 15 final conditions, found {len(entries)}")
    condition_keys = [(row["dataset"], row["model"], row["method"]) for row in entries]
    paths = [row["path"] for row in entries]
    if len(set(condition_keys)) != len(condition_keys):
        raise AssertionError("duplicate condition in prediction manifest")
    if len(set(paths)) != len(paths):
        raise AssertionError("duplicate prediction path in manifest")

    dataset_contracts: dict[str, dict[str, tuple[str, str]]] = {}
    for entry in entries:
        path = ROOT / entry["path"]
        if not path.is_file():
            raise FileNotFoundError(path)
        with path.open(newline="", encoding="utf-8-sig") as handle:
            reader = csv.DictReader(handle)
            columns = set(reader.fieldnames or [])
            rows = list(reader)
        if columns != ALLOWED_PREDICTION_COLUMNS:
            raise AssertionError(f"unsafe or unexpected columns in {path}: {sorted(columns)}")
        if any(part in column.lower() for column in columns for part in FORBIDDEN_COLUMN_PARTS):
            raise AssertionError(f"text-bearing column in {path}")
        if len(rows) != int(entry["n"]):
            raise AssertionError(f"row count mismatch in {path}")
        example_ids = [row["example_id"].strip() for row in rows]
        if any(not value for value in example_ids):
            raise AssertionError(f"empty example_id in {path}")
        if len(set(example_ids)) != len(example_ids):
            raise AssertionError(f"duplicate example_id in {path}")
        if any(
            row[column] not in LABELS
            for row in rows
            for column in ("target_label", "phase1_label", "final_label")
        ):
            raise AssertionError(f"invalid label in {path}")
        contract = {
            row["example_id"]: (row["target_label"], row["phase1_label"])
            for row in rows
        }
        previous = dataset_contracts.setdefault(entry["dataset"], contract)
        if contract != previous:
            raise AssertionError(
                f"target or Phase 1 labels are not aligned within {entry['dataset']}"
            )
        if entry["method"] == "SELF-DISCOVER":
            expected_plan = {
                "Llama 2": "ac645d4ab0d0b07883493ac21263cda8540c364ed4f6174b338e33bbd8b104ab",
                "Llama 3": "bca5cadcc99adc299fc5370c0edd2b3130a4fd25d1c7df298faf61c695703f8b",
            }[entry["model"]]
            if entry["plan_sha256"] != expected_plan:
                raise AssertionError(f"wrong cached-plan hash in prediction manifest: {path}")
        elif entry["plan_sha256"]:
            raise AssertionError(f"non-SELF-DISCOVER condition has a cached-plan hash: {path}")


def validate_checksums() -> None:
    manifest = ROOT / "provenance" / "release_checksums.sha256"
    if not manifest.is_file():
        raise FileNotFoundError(manifest)
    listed_paths: set[str] = set()
    for line in manifest.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        expected, relative = line.split("  ", 1)
        relative_path = Path(relative)
        if relative_path.is_absolute() or ".." in relative_path.parts:
            raise AssertionError(f"unsafe checksum path: {relative}")
        if relative in listed_paths:
            raise AssertionError(f"duplicate checksum entry: {relative}")
        listed_paths.add(relative)
        path = ROOT / relative
        if not path.is_file() or sha256(path) != expected:
            raise AssertionError(f"checksum mismatch: {relative}")

    if (ROOT / ".git").exists():
        tracked = subprocess.run(
            ["git", "ls-files", "-z"],
            cwd=ROOT,
            check=True,
            capture_output=True,
        ).stdout.decode("utf-8").split("\0")
        expected_paths = {
            relative for relative in tracked
            if relative and relative != "provenance/release_checksums.sha256"
        }
        missing = expected_paths - listed_paths
        extra = listed_paths - expected_paths
        if missing or extra:
            raise AssertionError(
                "checksum inventory mismatch; "
                f"missing={sorted(missing)}, extra={sorted(extra)}"
            )


def validate_annotation_audit() -> None:
    path = ROOT / "data" / "mixed_emotion" / "mixed_emotion_annotation_audit.csv"
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        columns = set(reader.fieldnames or [])
        rows = list(reader)
    if columns != ANNOTATION_AUDIT_COLUMNS:
        raise AssertionError(f"unexpected annotation-audit columns: {sorted(columns)}")
    if len(rows) != 300 or len({row["example_id"] for row in rows}) != 300:
        raise AssertionError("annotation audit must contain 300 unique examples")
    labels = {"Depression", "Neutral", "Happy"}
    confidence = {"Low", "Medium", "High"}
    for row in rows:
        if any(row[key] not in labels for key in ("target_label", "annotator_a_label", "annotator_b_label")):
            raise AssertionError(f"invalid annotation label at {row['example_id']}")
        if any(row[key] not in confidence for key in ("annotator_a_confidence", "annotator_b_confidence")):
            raise AssertionError(f"invalid annotation confidence at {row['example_id']}")
        expected = "yes" if row["annotator_a_label"] == row["annotator_b_label"] else "no"
        if row["agreement"] != expected:
            raise AssertionError(f"agreement flag mismatch at {row['example_id']}")
    if sum(row["agreement"] == "yes" for row in rows) != 277:
        raise AssertionError("annotation agreement count drifted")

    report = json.loads(
        (ROOT / "results" / "reports" / "mixed_emotion_annotation_audit.json").read_text(
            encoding="utf-8"
        )
    )
    expected_values = {
        "n": 300,
        "initial_agreements": 277,
        "initial_disagreements": 23,
        "annotator_a_vs_target": 288,
        "annotator_b_vs_target": 289,
        "agreed_labels_matching_target": 277,
        "direct_depression_happy_disagreements": 0,
        "disagreements_with_at_least_one_low_confidence_rating": 23,
        "adjudication_performed": False,
        "targets_modified_after_audit": False,
    }
    for key, value in expected_values.items():
        if report.get(key) != value:
            raise AssertionError(f"annotation report mismatch: {key}")
    ci = report.get("kappa_bootstrap", {}).get("ci", [])
    if len(ci) != 2 or [round(value, 4) for value in ci] != [0.8350, 0.9294]:
        raise AssertionError("annotation kappa bootstrap interval drifted")


def validate_public_mixed_phase1() -> None:
    phase1_path = ROOT / "data" / "mixed_emotion" / "mixed_emotion_phase1_outputs.csv"
    with phase1_path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        columns = set(reader.fieldnames or [])
        rows = list(reader)
    if columns != MIXED_PHASE1_COLUMNS:
        raise AssertionError(f"unexpected Mixed Emotion Phase 1 columns: {sorted(columns)}")
    if len(rows) != 300 or len({row["example_id"] for row in rows}) != 300:
        raise AssertionError("Mixed Emotion Phase 1 release must contain 300 unique examples")
    labels = {"Depression", "Neutral", "Happy"}
    if any(
        row["target_label"] not in labels or row["phase1_label"] not in labels
        for row in rows
    ):
        raise AssertionError("invalid label in Mixed Emotion Phase 1 release")
    if any(not 0.0 <= float(row["phase1_confidence"]) <= 1.0 for row in rows):
        raise AssertionError("invalid confidence in Mixed Emotion Phase 1 release")
    routed_values = [row["phase1_routed"].strip().lower() for row in rows]
    if any(value not in {"true", "false"} for value in routed_values):
        raise AssertionError("invalid routing flag in Mixed Emotion Phase 1 release")
    if sum(value == "true" for value in routed_values) != 86:
        raise AssertionError("Mixed Emotion routed count drifted")
    if sha256(phase1_path) != "55cfd42f619a7c46b0524a4d71f6c5bf73edc79277c4aed3401d283135c483b2":
        raise AssertionError("Mixed Emotion Phase 1 release file drifted")

    text_path = ROOT / "data" / "mixed_emotion" / "mixed_emotion_stress_test_300.csv"
    with text_path.open(newline="", encoding="utf-8") as handle:
        text_rows = list(csv.DictReader(handle))
    text_targets = {row["example_id"]: row["target_label"] for row in text_rows}
    phase1_targets = {row["example_id"]: row["target_label"] for row in rows}
    if phase1_targets != text_targets:
        raise AssertionError("Mixed Emotion text and Phase 1 releases are not row-aligned")


def validate_workload_report() -> None:
    path = ROOT / "results" / "reports" / "additional9000_generation_workload.csv"
    expected_columns = {
        "protocol", "routed_posts", "generation_calls", "calls_per_routed_post",
        "input_tokens", "generated_tokens", "generation_time_seconds",
        "generation_seconds_per_routed_post", "new_plan_discovery_calls",
    }
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        if set(reader.fieldnames or []) != expected_columns:
            raise AssertionError("unexpected generation-workload columns")
        rows = {row["protocol"]: row for row in reader}
    expected = {
        "Direct": (111, 111, 44374, 679, 54.85973342199998),
        "CoT": (111, 555, 332544, 56793, 3116.394805240004),
        "SELF-DISCOVER": (111, 111, 113638, 47884, 2568.494655098005),
    }
    if set(rows) != set(expected):
        raise AssertionError("generation-workload protocol set drifted")
    for protocol, values in expected.items():
        row = rows[protocol]
        actual = (
            int(row["routed_posts"]), int(row["generation_calls"]),
            int(row["input_tokens"]), int(row["generated_tokens"]),
            float(row["generation_time_seconds"]),
        )
        if actual[:4] != values[:4] or abs(actual[4] - values[4]) > 1e-12:
            raise AssertionError(f"generation-workload values drifted for {protocol}")
        if int(row["new_plan_discovery_calls"]) != 0:
            raise AssertionError(f"unexpected discovery calls for {protocol}")
        if abs(float(row["calls_per_routed_post"]) - values[1] / values[0]) > 1e-12:
            raise AssertionError(f"calls/post mismatch for {protocol}")
        if abs(float(row["generation_seconds_per_routed_post"]) - values[4] / values[0]) > 1e-12:
            raise AssertionError(f"time/post mismatch for {protocol}")


def validate_text_files() -> None:
    extensions = {".md", ".txt", ".json", ".csv", ".py", ".toml", ".cff", ".ipynb"}
    for path in ROOT.rglob("*"):
        if not path.is_file() or ".git" in path.parts or path.suffix.lower() not in extensions:
            continue
        if path.resolve() == Path(__file__).resolve():
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        for pattern in FORBIDDEN_TEXT_PATTERNS:
            if pattern.search(text):
                raise AssertionError(f"private path or credential-like value in {path.relative_to(ROOT)}")
        if path.suffix == ".ipynb":
            notebook = json.loads(text)
            if re.search(r"[가-힣]", text):
                raise AssertionError(f"non-English Hangul text in {path.relative_to(ROOT)}")
            opaque_markers = (
                "embedded_payload",
                "MIXED_EMOTION_PAYLOAD_B64",
                "base64.b64decode",
                '"base_uri"',
            )
            if any(marker in text for marker in opaque_markers):
                raise AssertionError(f"opaque data or local output metadata in {path.relative_to(ROOT)}")
            if notebook.get("metadata", {}).get("colab", {}).get("name") != path.name:
                raise AssertionError(f"stale Colab filename metadata in {path.relative_to(ROOT)}")
            for cell in notebook.get("cells", []):
                if cell.get("cell_type") == "code" and cell.get("outputs"):
                    raise AssertionError(f"notebook outputs were not stripped: {path.relative_to(ROOT)}")
                if cell.get("cell_type") == "code" and cell.get("execution_count") is not None:
                    raise AssertionError(f"notebook execution count was not stripped: {path.relative_to(ROOT)}")
                if cell.get("metadata"):
                    raise AssertionError(f"cell metadata was not stripped: {path.relative_to(ROOT)}")
                if cell.get("cell_type") == "code":
                    source = "".join(cell.get("source", []))
                    lines = source.splitlines()
                    if lines and lines[0].lstrip().startswith("%%"):
                        continue
                    source = "\n".join(
                        line for line in lines
                        if not line.lstrip().startswith(("%", "!"))
                    )
                    try:
                        ast.parse(source)
                    except SyntaxError as exc:
                        raise AssertionError(
                            f"invalid Python cell in {path.relative_to(ROOT)}: {exc}"
                        ) from exc


def validate_notebook_provenance() -> None:
    path = ROOT / "provenance" / "notebook_sources.csv"
    with path.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    if len(rows) != 10:
        raise AssertionError("notebook provenance must contain ten release notebooks")
    for row in rows:
        release_path = ROOT / row["release_notebook"]
        if not release_path.is_file():
            raise FileNotFoundError(release_path)
        if sha256(release_path) != row["release_sha256"]:
            raise AssertionError(f"stale notebook provenance hash: {row['release_notebook']}")


def validate_final_protocol() -> None:
    config = json.loads((ROOT / "configs" / "final_experiment.json").read_text(encoding="utf-8"))
    if config["phase1"]["selected_seed"] != 42:
        raise AssertionError("final Phase 1 seed drifted")
    if config["phase1"]["temperature"] != 1.4801950079829693:
        raise AssertionError("calibration temperature drifted")
    if config["phase1"]["routing_threshold"] != 0.70:
        raise AssertionError("routing threshold drifted")
    expected_plans = {
        "llama2_plan.json": "ac645d4ab0d0b07883493ac21263cda8540c364ed4f6174b338e33bbd8b104ab",
        "llama3_plan.json": "bca5cadcc99adc299fc5370c0edd2b3130a4fd25d1c7df298faf61c695703f8b",
    }
    for name, expected in expected_plans.items():
        path = ROOT / "plans" / name
        if sha256(path) != expected:
            raise AssertionError(f"released SELF-DISCOVER plan drifted: {name}")
    expected_prompts = {
        "prompts/policy.txt": "f14f4c1b4a442ac58b00689148bfcbc08b1af26718c7e9e1ff1b8d30218d2bdf",
        "prompts/direct/prompt.txt": "291269bea20b187ca10d369bc9dd6bd00fe97891af3b3a9c11d2062deb120d75",
        "prompts/cot/text_template.txt": "1e3470caeb6bd23b4731cc5956a35f549ed4a27be1f1ed2904ff41ee5e965813",
        "prompts/cot/turn_0.txt": "20b5ea1f79d8a6a833c8dcfdeae9be401378c90205d44805f3e1cbf3d46ae35c",
        "prompts/cot/turn_1.txt": "dff9b15c17fdb49ec756b069ea32bf721a1236bacdb9acacd9304b6f25f407f2",
        "prompts/cot/turn_2.txt": "ddba9797e1b96c757262f2848a9d35bece942d19a49b169bc6889bf2ce72f90b",
        "prompts/cot/turn_3.txt": "19a5a52536ddefab03cc8e7c3d5edad86c6623420e874fbeb584a3ccbb559be9",
        "prompts/cot/turn_4.txt": "bd8a3a8be52e9252abe3f1369f1f1fd690529a1d9bff8e98fe9b6c149cffe691",
        "prompts/self_discover/adapt.txt": "9cca8aa4fdf5c906c4b9db222eabc134850aa58efcd7d87a753f4f16228c7eb8",
        "prompts/self_discover/execute.txt": "0ddbeed3d3741005e18850a657c9f8d692c4ecd099722ae53ddb05ebc3423fad",
        "prompts/self_discover/implement_compact.txt": "5fc0717d55ec0cf161687ae380d5e2d2fe792c0b08ac1761f002e88cf1cc37ad",
        "prompts/self_discover/modules.txt": "3d2facbb3c2a4c72b9732140879a7e270cf778cf03a72735b949d5ba7fa3a472",
        "prompts/self_discover/select.txt": "7e01cb5cb86cc453194c3a685bf31a6f00e1c1321f01e59f299e061f5cf36f77",
        "prompts/self_discover/system.txt": "6e68c2912ffc1b474c2af33dbb2552ea1f485c47774fd5a237b30ac367fd4eb9",
        "prompts/self_discover/task.txt": "3164307356fd17b87b586b55decbbdf8218edf2eb7b8915405d355b2088a60f3",
    }
    for relative, expected in expected_prompts.items():
        if sha256(ROOT / relative) != expected:
            raise AssertionError(f"released prompt drifted: {relative}")

    direct_cot = notebook_literal_assignments(
        ROOT / "notebooks" / "colab" / "04_reddit_llama3_direct_cot.ipynb"
    )
    self_discover = notebook_literal_assignments(
        ROOT / "notebooks" / "colab" / "08_self_discover_v6c_final.ipynb"
    )
    embedded_plans = self_discover["RELEASE_CACHED_PLANS"]
    for model in ("llama2", "llama3"):
        released_plan = json.loads((ROOT / "plans" / f"{model}_plan.json").read_text(encoding="utf-8"))
        if embedded_plans[model] != released_plan:
            raise AssertionError(f"cached {model} plan and execution notebook differ")
    prompt_bindings = {
        "prompts/policy.txt": direct_cot["CLASSIFICATION_POLICY"],
        "prompts/direct/prompt.txt": direct_cot["DIRECT_TEMPLATE"],
        **{
            f"prompts/cot/turn_{index}.txt": value
            for index, value in enumerate(direct_cot["COT_REQUESTS"])
        },
        "prompts/self_discover/system.txt": self_discover["ANNOTATOR_SYSTEM_PROMPT"],
        "prompts/self_discover/modules.txt": self_discover["EMOTION_REASONING_MODULES"],
        "prompts/self_discover/task.txt": self_discover["TASK_LEVEL_DESCRIPTION"],
        "prompts/self_discover/select.txt": self_discover["select_prompt"],
        "prompts/self_discover/adapt.txt": self_discover["adapt_prompt"],
        "prompts/self_discover/implement_compact.txt": self_discover["IMPLEMENT_COMPACT_PROMPT"],
        "prompts/self_discover/execute.txt": self_discover["V6_TEMPLATE"],
    }
    for relative, notebook_value in prompt_bindings.items():
        released_value = (ROOT / relative).read_text(encoding="utf-8").rstrip("\n")
        if released_value != str(notebook_value).strip("\n"):
            raise AssertionError(f"prompt file and execution notebook differ: {relative}")
    mixed = ROOT / "data" / "mixed_emotion" / "mixed_emotion_stress_test_300.csv"
    if sha256(mixed) != "7bf27c4361999757701fe9a45ec6bcf1aa515f7fc57751982e56af2e81f86f84":
        raise AssertionError("Mixed Emotion release file drifted")
    notebook = (ROOT / "notebooks" / "colab" / "08_self_discover_v6c_final.ipynb").read_text(
        encoding="utf-8"
    )
    if 'RUN_VARIANTS = [\\"v6c_compact\\"]' not in notebook:
        raise AssertionError("final SELF-DISCOVER notebook is not fixed to v6c_compact")
    obsolete = ("v1_baseline", "v2_deanchored", "v3_domain_tasklevel", "v4_evidence_ledger")
    if any(value in notebook for value in obsolete):
        raise AssertionError("exploratory SELF-DISCOVER variant leaked into the final notebook")
    if 'PHASE1_INPUT_URL = os.environ.get(\\"CGSLR_PHASE1_INPUT_URL\\")' not in notebook:
        raise AssertionError("final SELF-DISCOVER notebook does not protect the restricted Reddit input")

    expected_revisions = {
        "llama2": "351844e75ed0bcbbe3f10671b3c808d2b83894ee",
        "llama3": "53346005fb0ef11d3b6a83b12c895cca40156b6c",
    }
    if config["phase2"]["models"]["llama2"]["revision"] != expected_revisions["llama2"]:
        raise AssertionError("Llama 2 revision drifted in final config")
    if config["phase2"]["models"]["llama3"]["revision"] != expected_revisions["llama3"]:
        raise AssertionError("Llama 3 revision drifted in final config")
    notebook_revisions = {
        expected_revisions["llama2"]: ("02_", "03_", "05_", "06_", "08_"),
        expected_revisions["llama3"]: ("04_", "07_", "08_", "10_"),
    }
    notebook_dir = ROOT / "notebooks" / "colab"
    for revision, prefixes in notebook_revisions.items():
        for prefix in prefixes:
            matches = list(notebook_dir.glob(f"{prefix}*.ipynb"))
            if len(matches) != 1 or revision not in matches[0].read_text(encoding="utf-8"):
                raise AssertionError(f"frozen model revision missing from notebook prefix {prefix}")

    phase1_notebook = (notebook_dir / "01_phase1_training_calibration_routing.ipynb").read_text(
        encoding="utf-8"
    )
    frozen_phase1_literals = (
        '"learning_rate\\": 4.03677668397417e-5',
        '"batch_size\\": 64',
        '"epochs\\": 3',
        '"weight_decay\\": 0.001',
        'USE_WANDB_SWEEP = False',
    )
    if any(value not in phase1_notebook for value in frozen_phase1_literals):
        raise AssertionError("Phase 1 notebook is not fixed to the reported selected settings")


def main() -> None:
    validate_predictions()
    validate_annotation_audit()
    validate_public_mixed_phase1()
    validate_workload_report()
    validate_text_files()
    validate_final_protocol()
    validate_notebook_provenance()
    validate_checksums()
    print("Release validation passed: files, privacy boundary, notebooks, and checksums are consistent.")


if __name__ == "__main__":
    main()
