from typing import List, Optional

from fastapi import Query


def get_expand(expand: Optional[str] = Query(None)) -> Optional[List[str]]:
    if expand:
        return expand.split(",")

    return None
