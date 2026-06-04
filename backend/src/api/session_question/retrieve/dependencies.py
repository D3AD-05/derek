from fastapi import Depends, HTTPException, Path
from src.api.common.dependencies import get_expand

from src.services.session_question.common.params import (
    SessionQuestionExpand,
    SessionQuestionRetrieveParams,
)


def get_session_retrieve_params(
    session_question_id: int = Path(..., gt=0),
    expand: list[str] | None = Depends(get_expand),
) -> SessionQuestionRetrieveParams:
    try:
        expand_set = {SessionQuestionExpand(e) for e in expand} if expand else set()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid expand option: {e}")

    return SessionQuestionRetrieveParams(id=session_question_id, expand=expand_set)
