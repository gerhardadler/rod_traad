from typing import Any, Callable
from fastapi import Request
from sqlalchemy import Engine
from sqlmodel import Session

from rod_traad.models import User


def create_user_id_middleware(engine: Engine):
    async def user_id_middleware(request: Request, call_next: Callable[..., Any]):
        with Session(engine) as session:
            user_id = request.query_params.get('user_id') or request.cookies.get(
                'user_id'
            )

            is_new_user = False

            user = None
            if user_id:
                user = session.get(User, user_id)

            if not user:
                is_new_user = True
                user = User()
                session.add(user)
                session.commit()
                session.refresh(user)

            request.state.user = user

        user_id = user.id
        response = await call_next(request)
        if is_new_user:
            response.set_cookie(
                key='user_id',
                value=user_id,
                httponly=True,
                samesite='lax',
            )
        return response

    return user_id_middleware
