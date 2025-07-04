from datetime import date, datetime
import locale
import logging
from typing import Any, Callable
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlmodel import Session
from rod_traad import config
from rod_traad.middleware import create_user_id_middleware
from rod_traad.models import User, setup_engine
from rod_traad.routers import editor, iframe, index, api, admin, statistics
from rod_traad.helpers.monkey_patch_starlette import monkey_patch_starlette

monkey_patch_starlette()


def date_format(value: date | Any):
    if isinstance(value, date):
        date_ = value.strftime('%d').lstrip('0')
        month_abbreviated = value.strftime('%b').rstrip('.')
        year = value.strftime('%Y')
        return f'{date_}. {month_abbreviated} {year}'
    return value


def datetime_format(value: datetime | Any):
    if isinstance(value, datetime):
        value = value.astimezone(config.TIMEZONE)
        return value.strftime('%d.%m.%Y %H:%M%z')
    return value


def float_format(value: float | Any, decimal_places: int = 2):
    if isinstance(value, float):
        return f'{value:.{decimal_places}f}'.replace('.', ',')
    return value


def percentage_format(value: float | Any, decimal_places: int = 0):
    if isinstance(value, float):
        formatted_number = f'{(value * 100):.{decimal_places}f}'
        return formatted_number.replace('.', ',') + '%'
    return value


def create_app():
    # Application uses Norwegian locale
    locale.setlocale(locale.LC_TIME, 'nb_NO.UTF-8')

    logger = logging.getLogger("uvicorn")
    logger.propagate = True

    app = FastAPI()

    app.mount('/static', StaticFiles(directory='rod_traad/static'), name='static')

    engine = setup_engine()

    templates = Jinja2Templates(directory='rod_traad/templates')

    templates.env.filters['date_format'] = date_format
    templates.env.filters['datetime_format'] = datetime_format
    templates.env.filters['float_format'] = float_format
    templates.env.filters['percentage_format'] = percentage_format
    templates.env.policies['json.dumps_kwargs'] = {'sort_keys': False}

    app.middleware("http")(create_user_id_middleware(engine))

    app.include_router(index.create_router(engine, templates))
    app.include_router(iframe.create_router(engine, templates))
    app.include_router(statistics.create_router(engine, templates))
    app.include_router(editor.create_router(engine, templates))

    app.mount('/api', api.create_api(engine, templates))
    app.mount('/admin', admin.create_admin(engine, templates))

    app.mount('/', StaticFiles(directory='rod_traad/root_static'), name='root_static')

    return app


main = create_app()
