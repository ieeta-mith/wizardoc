import asyncio
import time
import uuid
from dataclasses import dataclass, field

from src.config import config


@dataclass
class Session:
    id: str
    created_at: float = field(default_factory=time.time)
    last_used: float = field(default_factory=time.time)
    chunks: list[str] = field(default_factory=list)
    embeddings: list[list[float]] = field(default_factory=list)

    def touch(self) -> None:
        self.last_used = time.time()

    def is_expired(self) -> bool:
        return (time.time() - self.last_used) > config.session.ttl_seconds


class SessionStore:
    def __init__(self) -> None:
        self._sessions: dict[str, Session] = {}
        self._task: asyncio.Task | None = None

    def create(self) -> Session:
        session = Session(id=str(uuid.uuid4()))
        self._sessions[session.id] = session
        return session

    def get(self, session_id: str) -> Session | None:
        session = self._sessions.get(session_id)
        if session is None:
            return None
        if session.is_expired():
            del self._sessions[session_id]
            return None
        session.touch()
        return session

    def delete(self, session_id: str) -> None:
        self._sessions.pop(session_id, None)

    async def start_cleanup_task(self) -> None:
        self._task = asyncio.create_task(self._cleanup_loop())

    async def stop_cleanup_task(self) -> None:
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

    async def _cleanup_loop(self) -> None:
        while True:
            await asyncio.sleep(300)
            expired = [sid for sid, s in list(self._sessions.items()) if s.is_expired()]
            for sid in expired:
                del self._sessions[sid]


session_store = SessionStore()
