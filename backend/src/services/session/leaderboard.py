from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from src.models.session import SessionParticipant
from src.models.user import User


def get_session_leaderboard(
    *,
    session: Session,
    session_id: int,
) -> list[dict]:
    """Compute leaderboard for a session.

    Ranking rules:
    - Higher total_score ranks first
    - Tie-breaker: lower total_time_taken_ms ranks first
    - Stable tie-breaker: user.name asc, user_id asc

    Returns a list of dicts:
      { "rank": int, "user_id": int, "name": str, "score": int }
    """

    stmt = (
        select(
            SessionParticipant.user_id,
            User.name,
            User.email,
            SessionParticipant.total_score,
            SessionParticipant.total_time_taken_ms,
        )
        .join(User, User.id == SessionParticipant.user_id)
        .where(SessionParticipant.session_id == session_id)
        .order_by(
            SessionParticipant.total_score.desc(),
            SessionParticipant.total_time_taken_ms.asc(),
            User.name.asc(),
            SessionParticipant.user_id.asc(),
        )
    )

    rows = session.execute(stmt).all()

    items: list[dict] = []
    for idx, row in enumerate(rows, start=1):
        items.append(
            {
                "rank": idx,
                "user_id": int(row.user_id),
                "name": str(row.name),
                "email": str(row.email),
                "score": int(row.total_score or 0),
            }
        )

    return items
