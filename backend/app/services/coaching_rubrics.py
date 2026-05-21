import json
from functools import lru_cache
from pathlib import Path
from typing import Any

COACHING_RUBRICS_PATH = Path(__file__).with_name("coaching_rubrics.json")


class CoachingRubricsError(RuntimeError):
    pass


@lru_cache
def load_coaching_rubrics() -> dict[str, Any]:
    try:
        return json.loads(COACHING_RUBRICS_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise CoachingRubricsError("Coaching rubrics could not be loaded.") from exc


def render_coaching_rubrics_summary() -> str:
    rubrics = load_coaching_rubrics()
    lines = [
        f"Rubric version: {rubrics.get('version', 'unknown')}",
        rubrics.get("purpose", ""),
        (
            "Use these prompts internally to calibrate challenge level; do not output them "
            "as teacher scores, ratings, or progress labels."
        ),
    ]

    for question in rubrics.get("calibration_questions", []):
        lines.extend(
            [
                "",
                f"calibration_field: {question['field']}",
                f"question: {question['question']}",
                "options:",
            ]
        )
        for option in question.get("options", []):
            lines.append(f"- {option['value']}: {option['label']} — {option['description']}")

    for rubric_name, rubric in rubrics.get("rubrics", {}).items():
        lines.extend(["", f"rubric: {rubric_name}", f"scale: {rubric.get('scale', '')}"])
        for level in rubric.get("levels", []):
            lines.extend(
                [
                    f"- level: {level['level']}",
                    f"  label: {level['label']}",
                    f"  description: {level['description']}",
                    f"  coaching_implication: {level['coaching_implication']}",
                ]
            )

    return "\n".join(lines)
