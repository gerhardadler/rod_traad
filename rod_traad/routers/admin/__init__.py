from typing import Annotated
from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.templating import Jinja2Templates
from sqlalchemy import Engine

from rod_traad import config
from rod_traad.routers.admin import puzzles

from . import index


def create_admin(engine: Engine, templates: Jinja2Templates):  # noqa C901
    security = HTTPBasic()

    def verify_admin_credentials(
        credentials: Annotated[HTTPBasicCredentials, Depends(security)],
    ):
        if (
            credentials.username != config.ADMIN_USERNAME
            or credentials.password != config.ADMIN_PASSWORD
        ):
            raise HTTPException(status_code=401, detail="Invalid credentials")

    app = FastAPI(dependencies=[Depends(verify_admin_credentials)], debug=True)

    app.include_router(index.create_router(engine, templates))
    app.include_router(puzzles.create_router(engine, templates))

    return app
