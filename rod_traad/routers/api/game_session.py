import datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.templating import Jinja2Templates
from sqlalchemy import Engine
from sqlmodel import Session, select

from rod_traad import config
from rod_traad.dependencies import SessionDependency, UserDependency
from rod_traad.models import (
    Detail,
    GameSession,
    GameSessionPublic,
    GameSessionUpdate,
    Puzzle,
    User,
    is_game_session_complete,
)


def create_router(engine: Engine, templates: Jinja2Templates):  # noqa C901
    router = APIRouter(prefix='/game-session')

    @router.get('/today', response_model=GameSessionPublic)
    def get_game_session_today(
        session: Annotated[Session, Depends(SessionDependency(engine))],
        user: Annotated[User, Depends(UserDependency(engine))],
    ):
        today = datetime.datetime.now(config.TIMEZONE).date()
        query = select(Puzzle).where(
            Puzzle.date == today,
        )
        puzzle = session.exec(query).first()

        if not puzzle:
            raise HTTPException(status_code=404, detail="Puzzle for today not found.")

        assert puzzle.id is not None

        return get_game_session(session, user, puzzle.id)

    @router.put('/today', response_model=GameSessionPublic)
    def update_game_session_today(
        session: Annotated[Session, Depends(SessionDependency(engine))],
        user: Annotated[User, Depends(UserDependency(engine))],
        game_session: GameSessionUpdate,
    ):
        today = datetime.datetime.now(config.TIMEZONE).date()
        query = select(Puzzle).where(
            Puzzle.date == today,
        )
        puzzle = session.exec(query).first()

        if not puzzle:
            raise HTTPException(status_code=404, detail="Puzzle for today not found.")

        assert puzzle.id is not None

        return update_game_session(
            session,
            user,
            puzzle.id,
            game_session,
        )

    @router.get(
        '/',
        response_model=GameSessionPublic,
    )
    def get_game_session(
        session: Annotated[Session, Depends(SessionDependency(engine))],
        game_session_id: int,
    ):
        game_session = session.get(GameSession, game_session_id)
        return game_session

    @router.put('/', response_model=GameSessionPublic)
    def update_game_session(
        session: Annotated[Session, Depends(SessionDependency(engine))],
        user: Annotated[User, Depends(UserDependency(engine))],
        game_session_id: int,
        game_session: GameSessionUpdate,
    ):
        existing_session = session.get(GameSession, game_session_id)

        if not existing_session:
            raise HTTPException(404, "Game session not found.")

        if existing_session.user_id != user.id:
            raise HTTPException(
                403, "You do not have permission to update this session."
            )

        existing_session.guesses = game_session.guesses

        if game_session.start_time:
            existing_session.start_time = game_session.start_time
        if game_session.end_time:
            existing_session.end_time = game_session.end_time
        elif is_game_session_complete(game_session):
            existing_session.end_time = datetime.datetime.now(datetime.UTC)

        session.add(existing_session)
        session.commit()
        session.refresh(existing_session)

        return existing_session

    return router
