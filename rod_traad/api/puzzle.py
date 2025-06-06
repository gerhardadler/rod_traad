import datetime
from typing import Annotated
from fastapi import APIRouter
from fastapi.templating import Jinja2Templates
from pydantic import AfterValidator
from sqlalchemy import Engine
from sqlmodel import Session, select

from rod_traad.models import Puzzle


def create_router(engine: Engine, templates: Jinja2Templates):  # noqa C901
    router = APIRouter(prefix='/puzzle')

    @router.get('/')
    def get_puzzle(date: datetime.date):
        """
        Fetch the puzzle for the given date.
        """
        with Session(engine) as session:
            query = select(Puzzle).where(Puzzle.date == date)
            puzzle = session.exec(query).first()

        return puzzle

    @router.post('/')
    def post_puzzle(puzzle: Annotated[Puzzle, AfterValidator(Puzzle.model_validate)]):
        """
        Add a new puzzle to the database.
        """
        with Session(engine) as session:
            session.add(puzzle)
            session.commit()

    @router.get('/today')
    def get_today():
        """
        Fetch the puzzle for today.
        """
        today = datetime.datetime.now().date()
        return get_puzzle(today)

    return router
