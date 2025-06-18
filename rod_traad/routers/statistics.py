from datetime import datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.templating import Jinja2Templates
from sqlalchemy import Engine
from sqlmodel import Session, select

from rod_traad.config import TIMEZONE
from rod_traad.dependencies import SessionDependency, UserDependency
from rod_traad.models import GameSession, GameSessionPublic, Puzzle, User


def create_router(engine: Engine, templates: Jinja2Templates):  # noqa C901
    router = APIRouter(prefix='/statistics')

    @router.get('/')
    def get_statistics(
        session: Annotated[Session, Depends(SessionDependency(engine))],
        user: Annotated[User, Depends(UserDependency(engine))],
        request: Request,
        puzzle_id: int | None = None,
    ):
        if puzzle_id:
            puzzle = session.get(Puzzle, puzzle_id)
        else:
            today = datetime.now(TIMEZONE).date()
            puzzle = session.exec(select(Puzzle).where(Puzzle.date == today)).first()

        if not puzzle:
            raise HTTPException(status_code=404, detail="Puzzle for today not found.")

        query = select(GameSession).where(
            GameSession.user_id == user.id,
            GameSession.puzzle_id == puzzle.id,
        )
        game_session = session.exec(query).first()

        if not game_session:
            game_session = GameSession(user=user, puzzle_id=puzzle.id)
            session.add(game_session)
            session.commit()
            session.refresh(game_session)

        return templates.TemplateResponse(
            'statistics.html.jinja',
            {
                'request': request,
                'game_session': GameSessionPublic.model_validate(game_session),
            },
        )

    return router
