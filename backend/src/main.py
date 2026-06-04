import asyncio
from urllib.parse import urlparse

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import WebSocket

from src.api.auth.app import app as auth_app
from src.api.common.exception_handlers import register_exception_handlers
from src.api.common.middleware import register_middleware
from src.api.user.app import app as user_app
from src.api.community.app import app as community_app
from src.api.question_bank.app import app as question_bank_app
from src.api.question.app import app as question_app
from src.api.session.app import app as session_app
from src.api.session_question.app import app as session_question_app
from src.api.session_participiant.app import app as session_participiant_app
from src.core.config import settings

from src.api.ws.handler import session_ws_handler
from src.api.ws.leaderboard import leaderboard_ws_handler
from src.core.ws import ws_manager
from src.services.session_participant_question.worker import start_answer_workers

# from src.modules.community.app import app as community_app
# from src.modules.question.app import app as question_app

# Initialise fastapi app
app = FastAPI(
    title="Derek API",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)


def _cors_origins() -> list[str]:
    base = settings.web_app_base_url.rstrip("/")
    origins: set[str] = {base}

    parsed = urlparse(base)
    if settings.env.lower() in {"dev", "local"}:
        scheme = parsed.scheme or "http"
        for host in ("localhost", "127.0.0.1", "host.docker.internal"):
            for port in (3000, 5173):
                origins.add(f"{scheme}://{host}:{port}")

    if parsed.scheme and parsed.netloc:
        host = parsed.hostname
        port = parsed.port
        if host and port:
            if host == "localhost":
                origins.add(f"{parsed.scheme}://127.0.0.1:{port}")
                origins.add(f"{parsed.scheme}://host.docker.internal:{port}")
            elif host == "127.0.0.1":
                origins.add(f"{parsed.scheme}://localhost:{port}")
                origins.add(f"{parsed.scheme}://host.docker.internal:{port}")

    return sorted(origins)

app.add_middleware(
    CORSMiddleware,
    # NOTE: allow_origins cannot be ['*'] when allow_credentials=True.
    allow_origins=_cors_origins(),
    # In dev, it's common to run Vite on a different host port (e.g. Docker -p 3000:5173).
    # This regex keeps local dev flexible while prod can stay strict.
    allow_origin_regex=(
        r"^https?://(localhost|127\\.0\\.0\\.1|host\\.docker\\.internal)(:\\d+)?$"
        if settings.env.lower() in {"dev", "local"}
        else None
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register middleware
register_middleware(app)

# Register the exception handlers
register_exception_handlers(app)

# Mount HTTP apps
app.mount("/api/auth", auth_app)
app.mount("/api/user", user_app)
app.mount("/api/community", community_app)
app.mount("/api/question-bank", question_bank_app)
app.mount("/api/question", question_app)
app.mount("/api/session", session_app)
app.mount("/api/session_question", session_question_app)
app.mount("/api/session_participant", session_participiant_app)


@app.on_event("startup")
async def _startup() -> None:
    # Allow worker threads to schedule WS broadcasts.
    ws_manager.set_event_loop(asyncio.get_running_loop())

    # In-process background workers (queue consumer + timeout sweeper)
    start_answer_workers()


@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: int):
    await session_ws_handler(websocket=websocket, session_id=session_id)


@app.websocket("/ws/{session_id}/leaderboard")
async def websocket_leaderboard_endpoint(websocket: WebSocket, session_id: int):
    await leaderboard_ws_handler(websocket=websocket, session_id=session_id)
