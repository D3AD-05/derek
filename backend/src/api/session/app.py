from fastapi import FastAPI

from src.api.common.exception_handlers import register_exception_handlers

from .create.routes import router as create_router
from .delete.routes import router as delete_router
from .list.routes import router as list_router
from .retrieve.routes import router as retrieve_router
from .update.routes import router as update_router
from .leaderboard.routes import router as leaderboard_router
from .session_lifecycle.routes import router as lifecycle_router
from .start_question.routes import router as start_question

app = FastAPI()


# Update document
app.title = "Derek Session APIs"
app.description = "API endpoints for session CRUD."

# Register the exception handlers
register_exception_handlers(app)

app.include_router(create_router, tags=["Session"])
app.include_router(delete_router, tags=["Session"])
app.include_router(list_router, tags=["Session"])
app.include_router(retrieve_router, tags=["Session"])
app.include_router(update_router, tags=["Session"])
app.include_router(leaderboard_router, tags=["Session"])
app.include_router(lifecycle_router, tags=["Session"])
app.include_router(start_question, tags=["Session"])
