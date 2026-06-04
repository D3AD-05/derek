from sqlalchemy import select
from sqlalchemy.orm import Session

from src.core.database import transactional
from src.core.permissions import require_platform_admin
from src.models.user import User
from src.models.question import Question, Option
from src.services.question_bank.common.preconditions import ensure_question_bank_exists

from .common.schemas import QuestionUpdateData
from .common.loaders import get_question_or_raise
from .common.loaders import get_answer_type_or_raise


def update_question_service(
    *, session: Session, question_id: int, data: QuestionUpdateData, current_user: User
) -> Question:
    # ensure_question_exists(session=session, id=question_id)

    payload = data.model_dump(exclude_unset=True)

    # Question bank change # todo  required ?
    if "question_bank_id" in payload:
        ensure_question_bank_exists(session=session, id=payload["question_bank_id"])

    # > Getting question & validating
    question = get_question_or_raise(session=session, id=question_id)

    # Answer type is being changed
    if "answer_type_id" in payload:
        answer_type = get_answer_type_or_raise(
            session=session, id=payload["answer_type_id"]
        )
        is_scored = answer_type.code in {"radio", "checkbox"}
        payload["is_scored"] = is_scored
    else:
        answer_type = question.answer_type
        is_scored = question.is_scored

    # ! Option only alowed for scored Questions
    if not is_scored and payload.get("options"):
        raise ValueError(
            f"Option not alolowed on selected answer type : {answer_type.display_name}"
        )

    # & Transaction :
    with transactional(session):
        # - Update question
        for key, value in payload.items():
            if key != "options":
                setattr(question, key, value)
        question.updated_by = current_user.id

        # - Update options
        if "options" in payload:
            existing = {option.id: option for option in question.options}
            # convert -> 5: Option(id=5, option_text="Delhi", score=1)
            incoming_ids = set()

            for option in payload["options"]:
                if "id" in option:
                    incoming_ids.add(option["id"])
                    existing_option = existing.get(option["id"])
                    if not existing_option:
                        raise ValueError("Invalid option id")
                    existing_option.option_text = option["option_text"]
                    existing_option.score = option["score"] if is_scored else None
                    existing_option.updated_by = current_user.id

                else:
                    # > Create options
                    session.add(
                        Option(
                            question_id=question.id,
                            option_text=option["option_text"],
                            score=option["score"] if is_scored else None,
                            created_by=current_user.id,
                            updated_by=current_user.id,
                        )
                    )
            # ! Delete removed options
            if incoming_ids:
                for option_id, option in existing.items():
                    if option_id not in incoming_ids:
                        session.delete(option)

        return question
