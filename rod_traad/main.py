from datetime import date
import locale
from typing import Any
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from rod_traad.engine import setup_engine
from rod_traad.routers import index, api


def date_format(value: date | Any):
    if isinstance(value, date):
        weekday = value.strftime('%A')
        date_ = value.strftime('%d')
        month_abbreviated = value.strftime('%b').rstrip('.')
        year = value.strftime('%Y')
        return f'{weekday}, {date_}. {month_abbreviated}, {year}'
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

    app.include_router(index.create_router(engine, templates))
    app.include_router(api.create_router(engine, templates))

    return app


main = create_app()
