from pydantic import BaseModel


class AccessTokenOut(BaseModel):
    access_token: str
