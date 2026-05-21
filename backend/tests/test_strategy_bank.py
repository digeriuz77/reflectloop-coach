from app.services.strategy_bank import (
    get_strategy_ids,
    load_strategy_bank,
    render_strategy_bank_summary,
)


def test_strategy_bank_contains_granular_seed_strategies() -> None:
    bank = load_strategy_bank()

    assert bank["version"] == "0.1.0"
    assert len(bank["strategies"]) >= 20
    assert "dialogic_revoice_probe_wait" in get_strategy_ids()
    assert "wait_time_everyone_rehearses" in get_strategy_ids()
    assert "oracy_academic_recast_rehearsal" in get_strategy_ids()
    assert "vocab_three_word_preteach" in get_strategy_ids()
    assert "afl_mini_whiteboard_scan" in get_strategy_ids()
    assert "textbook_question_upgrade_dialogic" in get_strategy_ids()


def test_strategy_bank_summary_contains_only_declared_ids() -> None:
    summary = render_strategy_bank_summary()

    for strategy_id in get_strategy_ids():
        assert f"strategy_id: {strategy_id}" in summary
    assert "Only the strategy_id values listed below are valid." in summary


def test_every_strategy_has_required_coaching_metadata() -> None:
    bank = load_strategy_bank()
    required_fields = {
        "strategy_id",
        "title",
        "summary",
        "focus_areas",
        "teacher_move",
        "student_move",
        "coach_use_when",
        "implementation_steps",
        "cautions",
    }

    for strategy in bank["strategies"]:
        assert required_fields.issubset(strategy)
        assert strategy["focus_areas"]
        assert strategy["coach_use_when"]
        assert strategy["implementation_steps"]


def test_pilot_focus_areas_have_strategy_coverage() -> None:
    bank = load_strategy_bank()
    declared_focus_areas = set(bank["pilot_focus_areas"])
    covered_focus_areas = {
        focus_area
        for strategy in bank["strategies"]
        for focus_area in strategy["focus_areas"]
    }

    assert declared_focus_areas.issubset(covered_focus_areas)
