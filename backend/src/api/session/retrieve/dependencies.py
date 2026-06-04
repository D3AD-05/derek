from fastapi import Depends, HTTPException, Path
from src.api.common.dependencies import get_expand

from src.services.session.common.params import SessionExpand, SessionRetrieveParams


def get_session_retrieve_params(
    session_id: int = Path(..., gt=0),
    expand: list[str] | None = Depends(get_expand),
) -> SessionRetrieveParams:
    try:
        expand_set = { SessionExpand(e) for e in expand } if expand else set()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid expand option: {e}")

    return SessionRetrieveParams(id=session_id, expand=expand_set)
