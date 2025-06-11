from datetime import datetime
import tomllib
from typing import Annotated
from fastapi import APIRouter, Depends, Form, HTTPException, Request
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from pydantic import AfterValidator
from sqlalchemy import Engine
from sqlmodel import Session, col, select, func

from rod_traad.config import TIMEZONE
from rod_traad.dependencies import SessionDependency, UserDependency
from rod_traad.helpers.puzzle import get_empty_puzzle_data
from rod_traad.models import (
    GameSession,
    GameSessionPublic,
    Guess,
    Puzzle,
    PuzzleUpdate,
    User,
    is_game_session_won,
)


def create_router(engine: Engine, templates: Jinja2Templates):  # noqa C901
    router = APIRouter(prefix='/puzzles')

    @router.get('/')
    def get_puzzles(
        request: Request,
        session: Annotated[Session, Depends(SessionDependency(engine))],
    ):
        puzzles = session.exec(select(Puzzle)).all()

        return templates.TemplateResponse(
            'admin/puzzles.html.jinja',
            {
                'request': request,
                'puzzles': puzzles,
                'today': datetime.now(TIMEZONE).date(),
            },
        )

    @router.get('/new')
    def get_new_puzzle(
        request: Request,
        session: Annotated[Session, Depends(SessionDependency(engine))],
    ):
        today = datetime.now(TIMEZONE).date()

        current_number = session.exec(
            select(Puzzle.number)
            .where(col(Puzzle.number).is_not(None))
            .order_by(col(Puzzle.number).desc())
        ).first()

        next_number = (current_number or 0) + 1

        return templates.TemplateResponse(
            'admin/puzzle.html.jinja',
            {
                'request': request,
                'today': today,
                'puzzle': Puzzle(
                    number=next_number,
                    date=today,
                    data=get_empty_puzzle_data(),
                ),
            },
        )

    @router.get('/{puzzle_id}')
    def get_puzzle(
        puzzle_id: int,
        request: Request,
        session: Annotated[Session, Depends(SessionDependency(engine))],
    ):
        puzzle = session.get(Puzzle, puzzle_id)
        if not puzzle:
            raise HTTPException(status_code=404, detail="Puzzle not found.")

        return templates.TemplateResponse(
            'admin/puzzle.html.jinja',
            {
                'request': request,
                'puzzle': puzzle,
            },
        )

    @router.get('/{puzzle_id}/stats')
    def get_puzzle_stats(
        puzzle_id: int,
        request: Request,
        session: Annotated[Session, Depends(SessionDependency(engine))],
    ):
        puzzle = session.get(Puzzle, puzzle_id)
        if not puzzle:
            raise HTTPException(status_code=404, detail="Puzzle not found.")

        query = (
            select(GameSession)
            .where(GameSession.puzzle_id == puzzle_id)
            .join(Guess)
            .group_by(col(GameSession.id))
            # only started sessions are interesting
            .having(func.count(col(Guess.id)) > 0)
        )
        game_sessions = session.exec(query).all()

        won_game_sessions = []
        completed_game_sessions = []

        for game_session in game_sessions:
            if game_session.end_time is None:
                continue

            completed_game_sessions.append(game_session)
            if is_game_session_won(game_session):
                won_game_sessions.append(game_session)

        win_percent = (
            (len(won_game_sessions) / len(completed_game_sessions) * 100)
            if completed_game_sessions
            else None
        )

        return templates.TemplateResponse(
            'admin/puzzle_stats.html.jinja',
            {
                'request': request,
                'puzzle': puzzle,
                'game_count': len(game_sessions),
                'completed_game_count': len(completed_game_sessions),
                'win_percent': win_percent,
                'game_sessions': [
                    GameSessionPublic.model_validate(game_session)
                    for game_session in game_sessions
                ],
            },
        )

    @router.get('/{puzzle_id}/delete')
    def get_delete_puzzle(
        puzzle_id: int,
        session: Annotated[Session, Depends(SessionDependency(engine))],
    ):
        puzzle = session.get(Puzzle, puzzle_id)
        if not puzzle:
            raise HTTPException(status_code=404, detail="Puzzle not found.")

        session.delete(puzzle)
        session.commit()

        return RedirectResponse(
            '/admin/puzzles/',
            status_code=303,
        )

    @router.post('/new')
    def post_new_puzzle(
        request: Request,
        session: Annotated[Session, Depends(SessionDependency(engine))],
        puzzle: Annotated[PuzzleUpdate, Form()],
    ):
        new_puzzle = Puzzle(
            number=puzzle.number,
            date=puzzle.date,
            data=puzzle.data,
        )
        session.add(new_puzzle)
        session.commit()
        session.refresh(new_puzzle)

        return templates.TemplateResponse(
            'admin/puzzle.html.jinja',
            {
                'request': request,
                'puzzle': new_puzzle,
            },
        )

    @router.post('/{puzzle_id}')
    def update_puzzle(
        puzzle_id: int,
        request: Request,
        session: Annotated[Session, Depends(SessionDependency(engine))],
        puzzle: Annotated[PuzzleUpdate, Form()],
    ):
        existing_puzzle = session.get(Puzzle, puzzle_id)

        if not existing_puzzle:
            raise HTTPException(status_code=404, detail="Puzzle not found.")

        existing_puzzle.number = puzzle.number
        existing_puzzle.date = puzzle.date
        existing_puzzle.data = puzzle.data
        session.commit()
        session.refresh(existing_puzzle)

        return templates.TemplateResponse(
            'admin/puzzle.html.jinja',
            {
                'request': request,
                'puzzle': existing_puzzle,
            },
        )

    return router
