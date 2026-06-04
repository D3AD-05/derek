from __future__ import annotations

from typing import Dict, Set, List, Optional
from fastapi import WebSocket
import asyncio


class WSManager:
    def __init__(self):
        self._by_session: Dict[str, Set[WebSocket]] = {}
        # {
        # "session-1": { ws1, ws2, ws3 },
        # "session-2": { ws4 },
        # }
        self._lock = asyncio.Lock()
        self._loop: asyncio.AbstractEventLoop | None = None
        # & usage of lock
        # While coroutine 1 is paused at await:
        # Coroutine 2 mutates the same dict
        # Python’s dict may resize / rehash
        # Coroutine 1 resumes and continues assuming dict state is unchanged
        # !💥 ERROR

    async def connect(self, wb_session_id: str, websocket: WebSocket) -> None:
        async with self._lock:
            self._by_session.setdefault(wb_session_id, set()).add(websocket)
        # print("SESSIONS:", {k: len(v) for k, v in self._by_session.items()})

    def set_event_loop(self, loop: asyncio.AbstractEventLoop) -> None:
        # Called once from app startup (main event loop thread)
        self._loop = loop

    def broadcast_text_threadsafe(
        self,
        session_id: str,
        message: str,
    ) -> None:
        """Schedule a broadcast from any thread.

        Used by background worker threads that do DB writes.
        """

        if self._loop is None:
            raise RuntimeError(
                "WSManager event loop not set. Call ws_manager.set_event_loop() at startup."
            )

        asyncio.run_coroutine_threadsafe(
            self.broadcast_text(session_id=session_id, message=message),
            self._loop,
        )

    async def disconnect(self, wb_session_id: str, websocket: WebSocket) -> None:
        async with self._lock:
            conns = self._by_session.get(wb_session_id)
            if not conns:
                return

            conns.discard(websocket)

            # Remove empty session
            if not conns:
                self._by_session.pop(wb_session_id, None)

    async def broadcast_text(
        self,
        session_id: str,
        message: str,
        exclude: Optional[WebSocket] = None,
    ) -> None:
        # Copy targets under lock
        async with self._lock:
            targets: List[WebSocket] = list(self._by_session.get(session_id, set()))

        dead: List[WebSocket] = []
        for ws in targets:
            if exclude is not None and ws is exclude:
                continue

            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)

        # Cleanup dead sockets
        if dead:
            async with self._lock:
                conns = self._by_session.get(session_id)
                if not conns:
                    return

                for ws in dead:
                    conns.discard(ws)

                if not conns:
                    self._by_session.pop(session_id, None)


ws_manager = WSManager()
