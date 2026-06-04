from typing import Any

list_users_examples: dict[int | str, dict[str, Any]] = {
    200: {
        "description": "Users listed successfully.",
        "content": {
            "application/json": {
                "example": {
                    "status": "success",
                    "code": 200,
                    "message": "Users listed successfully.",
                    "data": {
                        "total_count": 2,
                        "count": 2,
                        "items": [
                            {
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
                            {
                                "id": 2,
                                "name": "Jane Smith",
                                "email": "jane@example.com",
                                "is_platform_admin": True,
                                "user_status": {
                                    "id": 1,
                                    "code": "active",
                                    "display_name": "Active",
                                },
                                "password_updated_at": "2025-01-10T08:00:00Z",
                                "created_by": 1,
                                "created_at": "2025-01-03T09:00:00Z",
                                "updated_by": 1,
                                "updated_at": "2025-01-10T08:00:00Z",
                            },
                        ],
                    },
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
        "description": "Failed to list users.",
        "content": {
            "application/json": {
                "example": {
                    "status": "error",
                    "code": 500,
                    "message": "Failed to list users.",
                }
            }
        },
    },
}
