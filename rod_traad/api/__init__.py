from fastapi import FastAPI
from fastapi.templating import Jinja2Templates
from sqlalchemy import Engine

from . import puzzle, game_session, user


def create_api(engine: Engine, templates: Jinja2Templates):  # noqa C901
    app = FastAPI()

    app.include_router(puzzle.create_router(engine, templates))
    app.include_router(user.create_router(engine, templates))
    app.include_router(game_session.create_router(engine, templates))

    return app
