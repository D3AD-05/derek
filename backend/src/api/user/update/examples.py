from typing import Any

update_user_examples: dict[int | str, dict[str, Any]] = {
    200: {
        "description": "User updated successfully.",
        "content": {
            "application/json": {
                "example": {
                    "status": "success",
                    "code": 200,
                    "message": "User updated successfully.",
                    "data": {
                        "id": 1,
                        "name": "John Doe Updated",
                        "email": "john@example.com",
                        "is_platform_admin": False,
                        "user_status": {
                            "id": 1,
                            "code": "active",
                            "display_name": "Active",
                        },
                        "password_updated_at": None,
                        "created_by": None,
                        "created_at": "2025-01-01T12:00:00Z",
                        "updated_by": None,
                        "updated_at": "2025-02-01T12:00:00Z",
                    },
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
        "description": "Failed to update user.",
        "content": {
            "application/json": {
                "example": {
                    "status": "error",
                    "code": 500,
                    "message": "Failed to update user.",
                }
            }
        },
    },
}
