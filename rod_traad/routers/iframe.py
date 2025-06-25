from datetime import datetime
import inspect
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.templating import Jinja2Templates
from sqlalchemy import Engine
from sqlmodel import Session, select

from rod_traad.config import TIMEZONE
from rod_traad.dependencies import SessionDependency, UserDependency
from rod_traad.models import GameSession, GameSessionPublic, Puzzle, User


def create_router(engine: Engine, templates: Jinja2Templates):  # noqa C901
    router = APIRouter(prefix='/iframe')

    @router.get('/')
    def get_iframe(
        session: Annotated[Session, Depends(SessionDependency(engine))],
        request: Request,
        puzzle_id: str | None = None,
    ):
        if puzzle_id:
            puzzle = session.get(Puzzle, puzzle_id)
        else:
            today = datetime.now(TIMEZONE).date()
            puzzle = session.exec(select(Puzzle).where(Puzzle.date == today)).first()

        if not puzzle:
            raise HTTPException(status_code=404, detail="Puzzle for today not found.")

        game_session = GameSession(id=999999, puzzle=puzzle)

        return templates.TemplateResponse(
            'iframe.html.jinja',
            {
                'request': request,
                'game_session': GameSessionPublic.model_validate(game_session),
            },
        )

    return router
