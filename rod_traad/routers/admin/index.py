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
    router = APIRouter(prefix='')

    @router.get('/')
    def get_index(
        request: Request,
    ):
        return templates.TemplateResponse(
            'admin/index.html.jinja',
            {
                'request': request,
            },
        )

    return router
