from typing import Annotated
from fastapi import APIRouter, Depends, Form, HTTPException, Request
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from sqlalchemy import Engine
from sqlmodel import Session

from rod_traad.dependencies import SessionDependency, UserDependency
from rod_traad.models import User

import google.oauth2.id_token
import google.auth.transport.requests


class LoginData(BaseModel):
    google_id_token: str | None = None


class LoginDetails(BaseModel):
    username: str
    email: str


def create_router(engine: Engine, templates: Jinja2Templates):  # noqa C901
    router = APIRouter(prefix='/login')

    @router.get('/')
    def get_login(
        request: Request,
    ):
        return templates.TemplateResponse(
            'login.html.jinja',
            {
                'request': request,
            },
        )

    @router.post('/')
    def post_login(
        session: Annotated[Session, Depends(SessionDependency(engine))],
        user: Annotated[User, Depends(UserDependency(engine))],
        form_data: Annotated[LoginData, Form(...)],
    ):
        if not form_data.google_id_token:
            raise HTTPException(status_code=400, detail="Google ID token is required.")

        request_adapter = google.auth.transport.requests.Request()

        try:
            id_info = google.oauth2.id_token.verify_oauth2_token(
                form_data.google_id_token, request_adapter
            )
            google_user_id = id_info['sub']
            email = id_info.get('email')

            if not user.email:
                user.email = email
            user.google_id = google_user_id

            session.add(user)
            session.commit()

            # Set cookie
            return RedirectResponse('/login/details', status_code=303)

        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Invalid Google ID token: {str(e)}"
            )

    @router.get('/details')
    def get_login_details(
        user: Annotated[User, Depends(UserDependency(engine))],
        request: Request,
    ):
        if not user.google_id:
            raise HTTPException(status_code=403, detail="User not logged in.")

        return templates.TemplateResponse(
            'login_details.html.jinja',
            {
                'request': request,
                'user': user,
            },
        )

    @router.post('/details')
    def post_login_details(
        session: Annotated[Session, Depends(SessionDependency(engine))],
        user: Annotated[User, Depends(UserDependency(engine))],
        form_data: Annotated[LoginDetails, Form(...)],
    ):
        if not user.google_id:
            raise HTTPException(status_code=403, detail="User not logged in.")

        user.username = form_data.username
        user.email = form_data.email
        session.add(user)
        session.commit()

        return RedirectResponse('/', status_code=303)

    return router
