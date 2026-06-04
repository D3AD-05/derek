from typing import Any

create_user_example: dict[int | str, dict[str, Any]] = {
    200: {
        "description": "User created successfully.",
        "content": {
            "application/json": {
                "example": {
                    "status": "success",
                    "code": 200,
                    "message": "User created successfully.",
                    "data": None,
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
        "description": "Failed to create user.",
        "content": {
            "application/json": {
                "example": {
                    "status": "error",
                    "code": 500,
                    "message": "Failed to create user.",
                }
            }
        },
    },
}
