from fastapi import APIRouter
from fastapi.templating import Jinja2Templates
from sqlalchemy import Engine
from . import puzzle


def create_router(engine: Engine, templates: Jinja2Templates):  # noqa C901
    router = APIRouter(prefix='/api')

    router.include_router(puzzle.create_router(engine, templates))

    return router
