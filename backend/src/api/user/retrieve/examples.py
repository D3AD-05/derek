from typing import Any

retrieve_user_examples: dict[int | str, dict[str, Any]] = {
    200: {
        "description": "User retrieved successfully.",
        "content": {
            "application/json": {
                "example": {
                    "status": "success",
                    "code": 200,
                    "message": "User retrieved successfully.",
                    "data": {
                        "id": 1,
                        "name": "John Doe",
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
                        "updated_at": "2025-01-02T12:00:00Z",
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
    500: {
        "description": "Failed to retrieve user.",
        "content": {
            "application/json": {
                "example": {
                    "status": "error",
                    "code": 500,
                    "message": "Failed to retrieve user.",
                }
            }
        },
    },
}
