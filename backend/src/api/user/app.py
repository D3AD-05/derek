from fastapi import FastAPI
from src.api.common.exception_handlers import register_exception_handlers

from .create.routes import router as create_user_router
from .delete.routes import router as delete_user_router
from .list.routes import router as list_user_router
from .retrieve.routes import router as retrieve_user_router
from .update.routes import router as update_user_router

# Initiate the User app
app = FastAPI()


# Update document
app.title = "Derek User APIs"
app.description = "API endpoints for user CRUD."

# Register the exception handlers
register_exception_handlers(app)

# Register API routes
app.include_router(create_user_router, tags=["User"])
app.include_router(list_user_router, tags=["User"])
app.include_router(retrieve_user_router, tags=["User"])
app.include_router(update_user_router, tags=["User"])
app.include_router(delete_user_router, tags=["User"])
