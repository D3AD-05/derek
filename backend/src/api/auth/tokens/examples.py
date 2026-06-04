from typing import Any

authenticate_examples: dict[int | str, dict[str, Any]] = {
    200: {
        "description": "User authenticated successfully.",
        "content": {
            "application/json": {
                "example": {
                    "status": "success",
                    "code": 200,
                    "message": "User authenticated successfully.",
                    "data": {
                        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MzAyODg5MDQsInN1YiI6ImpvaG5AZXhhbXBsZS5jb20ifQ.tFe"
                    },
                }
            }
        },
    },
    401: {
        "description": "Incorrect email or password.",
        "content": {
            "application/json": {
                "example": {
                    "status": "error",
                    "code": 401,
                    "message": "Incorrect email or password.",
                }
            }
        },
    },
    422: {
        "description": "Validation failed.",
        "content": {
            "application/json": {
                "example": {
                    "status": "error",
                    "code": 422,
                    "message": "Validation failed.",
                    "errors": [],
                }
            }
        },
    },
    500: {
        "description": "Failed to authenticate user.",
        "content": {
            "application/json": {
                "example": {
                    "status": "error",
                    "code": 500,
                    "message": "Failed to authenticate user.",
                }
            }
        },
    },
}


refresh_examples: dict[int | str, dict[str, Any]] = {
    200: {
        "description": "New access_token provisioned successfully.",
        "content": {
            "application/json": {
                "example": {
                    "status": "success",
                    "code": 200,
                    "message": "New access_token provisioned successfully.",
                    "data": {
                        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MzAyODg5MDQsInN1YiI6ImpvaG5AZXhhbXBsZS5jb20ifQ.tFeoJtUjepRaJ9WQRLwU89OkcOdLcs"
                    },
                }
            }
        },
    },
    401: {
        "description": "Invalid refresh_token provided.",
        "content": {
            "application/json": {
                "example": {
                    "status": "error",
                    "code": 401,
                    "message": "Invalid refresh_token provided.",
                }
            }
        },
    },
    422: {
        "description": "Validation failed.",
        "content": {
            "application/json": {
                "example": {
                    "status": "error",
                    "code": 422,
                    "message": "Validation failed.",
                    "errors": [],
                }
            }
        },
    },
    500: {
        "description": "Failed to provision new access_token.",
        "content": {
            "application/json": {
                "example": {
                    "status": "error",
                    "code": 500,
                    "message": "Failed to provision new access_token.",
                }
            }
        },
    },
}
