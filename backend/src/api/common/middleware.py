from time import time

from fastapi import FastAPI, Request

from src.core.log import logger

api_description = """
Backend API of Derek.
The links to module specific documents are provided below: \n
[Auth]({base_url}/api/auth/docs) \n
[User]({base_url}/api/user/docs) \n
"""


def register_middleware(app: FastAPI):
    # Middleware for logging requests
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        start_time = time()
        logger.info(f"Incoming request: {request.method} {request.url}")
        response = await call_next(request)
        process_time = time() - start_time
        logger.info(
            f"Completed response: {response.status_code} in {process_time:.2f}s"
        )
        return response

    # Middleware for setting API description
    @app.middleware("http")
    async def dynamic_description_middleware(request: Request, call_next):
        base_url = str(request.base_url).rstrip("/")

        app.description = api_description.format(base_url=base_url)

        response = await call_next(request)

        return response
