from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates
from sqlalchemy import Engine

from rod_traad.helpers.puzzle import get_puzzle_today


def create_router(engine: Engine, templates: Jinja2Templates):  # noqa C901
    router = APIRouter(prefix='')

    @router.get('/')
    def get_index(request: Request):
        return templates.TemplateResponse(
            'index.html.jinja',
            {
                'request': request,
                'puzzle': get_puzzle_today(),
            },
        )

    return router
