from fastapi import Depends, HTTPException, Path
from src.api.common.dependencies import get_expand

from src.services.question.common.params import QuestionExpand, QuestionRetrieveParams


def get_question_retrieve_params(
    question_id: int = Path(..., gt=0),
    expand: list[str] | None = Depends(get_expand),
) -> QuestionRetrieveParams:
    try:
        expand_set = { QuestionExpand(e) for e in expand } if expand else set()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid expand option: {e}")

    return QuestionRetrieveParams(id=question_id, expand=expand_set)
