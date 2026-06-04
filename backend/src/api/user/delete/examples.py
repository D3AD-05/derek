from typing import Any

delete_user_examples: dict[int | str, dict[str, Any]] = {
    200: {
        "description": "User deleted successfully.",
        "content": {
            "application/json": {
                "example": {
                    "status": "success",
                    "code": 200,
                    "message": "User deleted successfully.",
                    "data": None,
                }
            }
        },
    },
    400: {
        "description": "User cannot be deleted due to foreign-key constraints.",
        "content": {
            "application/json": {
                "example": {
                    "status": "error",
                    "code": 400,
                    "message": "This user cannot be deleted since it is in use.",
                }
            }
        },
    },
    404: {
        "description": "User not found.",
        "content": {
            "application/json": {
                "example": {
                    "status": "error",
                    "code": 404,
                    "message": "User with user_id 99 not found.",
                }
            }
        },
    },
    500: {
        "description": "Failed to delete user.",
        "content": {
            "application/json": {
                "example": {
                    "status": "error",
                    "code": 500,
                    "message": "Failed to delete user.",
                }
            }
        },
    },
}
