import json
from functools import lru_cache
from pathlib import Path
from typing import Any

STRATEGY_BANK_PATH = Path(__file__).with_name("strategy_bank.json")


class StrategyBankError(RuntimeError):
    pass


@lru_cache
def load_strategy_bank() -> dict[str, Any]:
    try:
        return json.loads(STRATEGY_BANK_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise StrategyBankError("Strategy bank could not be loaded.") from exc


def get_strategy_ids() -> set[str]:
    bank = load_strategy_bank()
    return {strategy["strategy_id"] for strategy in bank.get("strategies", [])}


def render_strategy_bank_summary() -> str:
    bank = load_strategy_bank()
    lines: list[str] = [
        f"Strategy bank version: {bank.get('version', 'unknown')}",
        "Only the strategy_id values listed below are valid.",
    ]

    for strategy in bank.get("strategies", []):
        alexander = strategy.get("alexander_mapping", {})
        look_fors = strategy.get("look_fors", {})
        knight = strategy.get("jim_knight_big_four", {})
        hits = strategy.get("hits_multiple_exposures", {})
        lines.extend(
            [
                "",
                f"strategy_id: {strategy['strategy_id']}",
                f"title: {strategy['title']}",
                f"focus_areas: {', '.join(strategy.get('focus_areas', []))}",
                f"summary: {strategy['summary']}",
                f"teacher_move: {strategy['teacher_move']}",
                f"student_move: {strategy.get('student_move', '')}",
                f"coach_use_when: {'; '.join(strategy.get('coach_use_when', []))}",
                "alexander_discourse_capacities: "
                + ", ".join(alexander.get("discourse_capacities", [])),
                "alexander_uptake_moves: " + ", ".join(alexander.get("uptake_moves", [])),
                f"look_for_response_uptake: {look_fors.get('response_uptake', '')}",
                f"look_for_wait_time: {look_fors.get('wait_time', '')}",
                "knight_checks_for_understanding: "
                + knight.get("checks_for_understanding", ""),
                "hits_multiple_exposures: "
                + f"{hits.get('continuum_level', '')} - {hits.get('exposure_pattern', '')}",
                "implementation_steps: "
                + " | ".join(strategy.get("implementation_steps", [])),
                "observable_indicators: "
                + " | ".join(strategy.get("observable_indicators", [])),
                "cautions: " + " | ".join(strategy.get("cautions", [])),
            ]
        )

    return "\n".join(lines)
