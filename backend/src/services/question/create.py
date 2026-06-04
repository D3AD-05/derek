from sqlalchemy.orm import Session

from src.core.database import transactional
from src.core.permissions import require_platform_admin
from src.models.user import User
from src.services.question_bank.common.preconditions import ensure_question_bank_exists
from src.models.question import Question, Option
from .common.schemas import QuestionData
from .common.loaders import get_answer_type_or_raise


def create_question_service(
    *, session: Session, data: QuestionData, current_user: User
):

    # ensure question bank
    if data.question_bank_id:
        ensure_question_bank_exists(session=session, id=data.question_bank_id)

    # ensure & get answer_type
    answer_type = get_answer_type_or_raise(session=session, id=data.answer_type_id)

    # is_scored is true on radio or checkbox
    is_scored = answer_type.code in {"radio", "checkbox"}
    with transactional(session):
        # add to db
        new_question = Question(
            title=data.title,
            question_bank_id=data.question_bank_id,
            answer_type_id=data.answer_type_id,
            is_scored=is_scored,
            time_limit_ms=data.time_limit_ms,
            created_by=current_user.id,
            updated_by=current_user.id,
        )

        session.add(new_question)
        session.flush()
        if data.options:
            for opt in data.options:
                session.add(
                    Option(
                        question_id=new_question.id,
                        option_text=opt.option_text,
                        score=opt.score if is_scored else None,
                        created_by=current_user.id,
                        updated_by=current_user.id,
                    )
                )
    return new_question
