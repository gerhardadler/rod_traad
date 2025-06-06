from fastapi import APIRouter
from fastapi.templating import Jinja2Templates
from sqlalchemy import Engine
from sqlmodel import Session

from rod_traad.models import User


def create_router(engine: Engine, templates: Jinja2Templates):  # noqa C901
    router = APIRouter(prefix='/user')

    @router.get('/')
    def get_user(id_: str):
        with Session(engine) as session:
            user = session.get(User, id_)

        return user

    @router.post('/')
    def post_user():
        """
        Add a new user to the database.
        """
        with Session(engine) as session:
            user = User()
            session.add(user)
            session.commit()
            session.refresh(user)

        return user

    return router
