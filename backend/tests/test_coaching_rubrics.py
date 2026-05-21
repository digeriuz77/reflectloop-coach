from app.services.coaching_rubrics import load_coaching_rubrics, render_coaching_rubrics_summary


def test_coaching_rubrics_include_dialogic_and_reflection_calibration() -> None:
    rubrics = load_coaching_rubrics()
    calibration_fields = {
        question["field"] for question in rubrics["calibration_questions"]
    }

    assert "implementation_pattern" in calibration_fields
    assert "ownership_signal" in calibration_fields
    assert "dialogic_participation_pattern" in calibration_fields
    assert "reflective_depth_signal" in calibration_fields
    assert "dialogic_talk_level" in rubrics["rubrics"]
    assert len(rubrics["rubrics"]["dialogic_talk_level"]["levels"]) == 5


def test_coaching_rubrics_summary_warns_against_teacher_facing_scores() -> None:
    summary = render_coaching_rubrics_summary()

    assert "do not output them as teacher scores" in summary
    assert "implementation_pattern" in summary
    assert "dialogic_participation_pattern" in summary
    assert "reflective_depth_signal" in summary
