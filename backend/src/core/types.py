from typing import Generic, Sequence, TypedDict, TypeVar

from pydantic import AfterValidator
from src.core.validators import not_empty
from typing_extensions import Annotated

NotEmptyStr = Annotated[str, AfterValidator(not_empty)]

T = TypeVar("T")


class ListResult(TypedDict, Generic[T]):
    total_count: int
    count: int
    items: Sequence[T]
