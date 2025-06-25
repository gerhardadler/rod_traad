import datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.templating import Jinja2Templates
from sqlalchemy import Engine
from sqlmodel import Session

from rod_traad.dependencies import SessionDependency, UserDependency
from rod_traad.models import (
    GameSession,
    GameSessionPublic,
    GameSessionUpdate,
    User,
    is_game_session_complete,
)


def create_router(engine: Engine, templates: Jinja2Templates):  # noqa C901
    router = APIRouter(prefix='/game-session')

    @router.get(
        '/',
        response_model=GameSessionPublic,
    )
    def get_game_session(
        session: Annotated[Session, Depends(SessionDependency(engine))],
        game_session_id: str,
    ):
        game_session = session.get(GameSession, game_session_id)
        return game_session

    @router.put('/', response_model=GameSessionPublic)
    def update_game_session(
        session: Annotated[Session, Depends(SessionDependency(engine))],
        user: Annotated[User, Depends(UserDependency(engine))],
        game_session_id: str,
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
