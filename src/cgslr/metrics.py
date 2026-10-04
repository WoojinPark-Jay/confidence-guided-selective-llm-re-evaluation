"""Dependency-light metrics used to verify released predictions."""

from __future__ import annotations

import math
from collections import Counter
from typing import Iterable, Mapping

LABELS = ("Depression", "Neutral", "Happy")


def _validate_labels(values: Iterable[str], name: str) -> list[str]:
    result = [str(value).strip() for value in values]
    invalid = sorted(set(result) - set(LABELS))
    if invalid:
        raise ValueError(f"{name} contains invalid labels: {invalid}")
    return result


def macro_f1(target: Iterable[str], predicted: Iterable[str]) -> float:
    target = _validate_labels(target, "target")
    predicted = _validate_labels(predicted, "predicted")
    if len(target) != len(predicted) or not target:
        raise ValueError("target and predicted must be non-empty and have equal length")
    scores = []
    for label in LABELS:
        tp = sum(t == label and p == label for t, p in zip(target, predicted))
        fp = sum(t != label and p == label for t, p in zip(target, predicted))
        fn = sum(t == label and p != label for t, p in zip(target, predicted))
        denominator = 2 * tp + fp + fn
        scores.append(0.0 if denominator == 0 else 2 * tp / denominator)
    return sum(scores) / len(scores)


def confusion_matrix(target: Iterable[str], predicted: Iterable[str]) -> list[list[int]]:
    target = _validate_labels(target, "target")
    predicted = _validate_labels(predicted, "predicted")
    counts = Counter(zip(target, predicted))
    return [[counts[(truth, guess)] for guess in LABELS] for truth in LABELS]


def summarize_rows(rows: Iterable[Mapping[str, str]]) -> dict[str, float | int | list[list[int]]]:
    rows = list(rows)
    if not rows:
        raise ValueError("prediction file is empty")
    target = _validate_labels((row["target_label"] for row in rows), "target_label")
    phase1 = _validate_labels((row["phase1_label"] for row in rows), "phase1_label")
    final = _validate_labels((row["final_label"] for row in rows), "final_label")
    phase1_correct = [a == b for a, b in zip(target, phase1)]
    final_correct = [a == b for a, b in zip(target, final)]
    corrected = sum(not before and after for before, after in zip(phase1_correct, final_correct))
    introduced = sum(before and not after for before, after in zip(phase1_correct, final_correct))
    return {
        "n": len(rows),
        "phase1_accuracy_percent": 100 * sum(phase1_correct) / len(rows),
        "accuracy_percent": 100 * sum(final_correct) / len(rows),
        "macro_f1_percent": 100 * macro_f1(target, final),
        "corrected": corrected,
        "introduced": introduced,
        "net_corrections": corrected - introduced,
        "exact_mcnemar_vs_phase1": exact_mcnemar_p(corrected, introduced),
        "confusion_matrix": confusion_matrix(target, final),
    }


def exact_mcnemar_p(a_wrong_b_correct: int, a_correct_b_wrong: int) -> float:
    """Two-sided exact McNemar p-value from the two discordant counts."""
    b = int(a_wrong_b_correct)
    c = int(a_correct_b_wrong)
    if b < 0 or c < 0:
        raise ValueError("discordant counts must be non-negative")
    n = b + c
    if n == 0:
        return 1.0
    k = min(b, c)
    tail = sum(math.comb(n, i) for i in range(k + 1)) / (2**n)
    return min(1.0, 2.0 * tail)


def holm_adjust(p_values: Iterable[float]) -> list[float]:
    """Holm step-down family-wise error adjustment."""
    values = [float(value) for value in p_values]
    order = sorted(range(len(values)), key=values.__getitem__)
    adjusted = [0.0] * len(values)
    running = 0.0
    total = len(values)
    for rank, index in enumerate(order):
        candidate = min(1.0, (total - rank) * values[index])
        running = max(running, candidate)
        adjusted[index] = running
    return adjusted

