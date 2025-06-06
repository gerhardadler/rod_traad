from datetime import date
import locale
from typing import Any, Callable
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlmodel import Session
from rod_traad.middleware import create_user_id_middleware
from rod_traad.models import User, setup_engine
from rod_traad.routers import index
from rod_traad.api import create_api


def date_format(value: date | Any):
    if isinstance(value, date):
        date_ = value.strftime('%d').lstrip('0')
        month_abbreviated = value.strftime('%b').rstrip('.')
        year = value.strftime('%Y')
        return f'{date_}. {month_abbreviated} {year}'
    return value


def float_format(value: float | Any):
    if isinstance(value, float):
        return f'{value:.2f}'.replace('.', ',')
    return value


def create_app():
    # Application uses Norwegian locale
    locale.setlocale(locale.LC_TIME, 'nb_NO.UTF-8')

    app = FastAPI()

    app.mount('/static', StaticFiles(directory='rod_traad/static'), name='static')

    engine = setup_engine()

    templates = Jinja2Templates(directory='rod_traad/templates')

    templates.env.filters['date_format'] = date_format  # type: ignore
    templates.env.filters['float_format'] = float_format  # type: ignore

    app.middleware("http")(create_user_id_middleware(engine))

    app.include_router(index.create_router(engine, templates))
    app.mount('/api', create_api(engine, templates))

    return app


main = create_app()
