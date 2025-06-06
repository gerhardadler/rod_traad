from fastapi import HTTPException, Request, status
from sqlalchemy import Engine
from sqlmodel import Session

from rod_traad.models import User


class UserDependency:
    def __init__(self, engine: Engine):
        self.engine = engine

    def __call__(self, request: Request, user_id: str | None = None):
        if request.state.user:
            return request.state.user

        user_id = user_id or request.cookies.get('user_id')

        user = None
        with Session(self.engine) as session:
            user = session.get(User, user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found."
            )

        return user


class SessionDependency:
    def __init__(self, engine: Engine):
        self.engine = engine

    def __call__(self):
        with Session(self.engine) as session:
            yield session
