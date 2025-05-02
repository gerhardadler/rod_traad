import datetime
from fastapi import APIRouter
from fastapi.templating import Jinja2Templates
from sqlalchemy import Engine

from rod_traad.helpers.puzzle import get_puzzle, get_puzzle_today


def create_router(engine: Engine, templates: Jinja2Templates):  # noqa C901
    router = APIRouter(prefix='')

    @router.get('/today')
    def get_today():
        return get_puzzle_today()

    @router.get('/{date}')
    def get_date(date: datetime.date):
        return get_puzzle(date)

    return router
