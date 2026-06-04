from fastapi import FastAPI
from src.api.auth.tokens.routes import router as tokens_router
from src.api.common.exception_handlers import register_exception_handlers
from src.api.auth.password.routes import router as password_router

# Initiate the IAM FastAPI app
app = FastAPI()

# Update document
app.title = "Derek Authentication APIs"
app.description = "API endpoints for authentication."

# Register the exception handlers
register_exception_handlers(app)

# Register API routes
app.include_router(tokens_router, tags=["Auth"])
app.include_router(password_router, tags=["Auth"])
