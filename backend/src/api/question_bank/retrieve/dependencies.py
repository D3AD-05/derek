from typing import Optional

from fastapi import Depends, HTTPException
from src.api.common.dependencies import get_expand
from src.services.question_bank.common.params import (
    QuestionBankExpand,
    QuestionBankRetrieveParams,
)


def get_question_bank_retrieve_params(
    expand: Optional[list[str]] = Depends(get_expand),
) -> QuestionBankRetrieveParams:
    try:
        expand_set = {QuestionBankExpand(e) for e in expand} if expand else set()
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid expand option: {e}",
        )

    return QuestionBankRetrieveParams(expand=expand_set)
