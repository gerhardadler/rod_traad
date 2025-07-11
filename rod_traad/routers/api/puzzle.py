from typing import Annotated
from fastapi import APIRouter
from fastapi.templating import Jinja2Templates
from pydantic import AfterValidator
from sqlalchemy import Engine
from sqlmodel import Session

from rod_traad.models import Puzzle, UnofficialPuzzleCreate


def create_router(engine: Engine, templates: Jinja2Templates):  # noqa C901
    router = APIRouter(prefix='/puzzle')

    @router.post('/unofficial')
    def post_puzzle(
        puzzle_create: Annotated[
            UnofficialPuzzleCreate,
            AfterValidator(UnofficialPuzzleCreate.model_validate),
        ],
    ):
        puzzle = Puzzle.model_validate(puzzle_create.model_dump())

        with Session(engine) as session:
            session.add(puzzle)
            session.commit()

    return router
