from datetime import datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.templating import Jinja2Templates
from pydantic import AfterValidator
from sqlalchemy import Engine
from sqlmodel import Session, select

from rod_traad.config import TIMEZONE
from rod_traad.dependencies import SessionDependency, UserDependency
from rod_traad.models import GameSession, Puzzle, UnofficialPuzzleCreate, User


def create_router(engine: Engine, templates: Jinja2Templates):  # noqa C901
    router = APIRouter(prefix='/redigerer')

    @router.get('/')
    def get_editor(
        session: Annotated[Session, Depends(SessionDependency(engine))],
        user: Annotated[User, Depends(UserDependency(engine))],
        request: Request,
    ):
        return templates.TemplateResponse(
            'editor.html.jinja',
            {
                'request': request,
            },
        )

    return router
