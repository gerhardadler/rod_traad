from datetime import datetime
import json
import tomllib
from typing import Annotated, Any
from fastapi import APIRouter, Body, Depends, Form, HTTPException, Request
from fastapi.exceptions import RequestValidationError
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
    PuzzleCreate,
    PuzzlePublic,
    PuzzleUpdate,
    Solution,
    SolutionPublic,
    User,
    Word,
    WordPublic,
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

        puzzle = PuzzlePublic(
            number=next_number,
            date=today,
            solutions=[
                SolutionPublic(
                    difficulty=s,
                    words=[WordPublic(position=s * 4 + w) for w in range(4)],
                )
                for s in range(4)
            ],
        )

        print(puzzle.model_dump(mode='json'))

        return templates.TemplateResponse(
            'admin/puzzle.html.jinja',
            {
                'request': request,
                'today': today,
                'puzzle': puzzle,
                'dumped_puzzle': puzzle.model_dump(mode='json'),
            },
        )

    @router.get('/{puzzle_id}')
    def get_puzzle(
        puzzle_id: str,
        request: Request,
        session: Annotated[Session, Depends(SessionDependency(engine))],
    ):
        puzzle = session.get(Puzzle, puzzle_id)
        if not puzzle:
            raise HTTPException(status_code=404, detail="Puzzle not found.")

        puzzle_public = PuzzlePublic.model_validate(puzzle)
        return templates.TemplateResponse(
            'admin/puzzle.html.jinja',
            {
                'request': request,
                'puzzle': puzzle_public,
                'dumped_puzzle': puzzle_public.model_dump(mode='json'),
            },
        )

    @router.get('/{puzzle_id}/stats')
    def get_puzzle_stats(
        puzzle_id: str,
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
        puzzle_id: str,
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
    async def post_new_puzzle(
        request: Request,
        session: Annotated[Session, Depends(SessionDependency(engine))],
    ):
        puzzle = PuzzleCreate.model_validate(await request.form())

        new_puzzle = Puzzle.model_validate(puzzle.model_dump(mode='json'))
        session.add(new_puzzle)
        session.commit()
        session.refresh(new_puzzle)

        public_puzzle = PuzzlePublic.model_validate(new_puzzle)

        return templates.TemplateResponse(
            'admin/puzzle.html.jinja',
            {
                'request': request,
                'puzzle': public_puzzle,
                'dumped_puzzle': public_puzzle.model_dump(mode='json'),
            },
        )

    @router.post('/{puzzle_id}')
    async def update_puzzle(
        puzzle_id: str,
        request: Request,
        session: Annotated[Session, Depends(SessionDependency(engine))],
    ):
        puzzle_update = PuzzleUpdate.model_validate(await request.form())

        puzzle = Puzzle.model_validate(puzzle_update)

        session.merge(puzzle)
        session.commit()
        # session.refresh(puzzle)

        public_puzzle = PuzzlePublic.model_validate(puzzle)

        return templates.TemplateResponse(
            'admin/puzzle.html.jinja',
            {
                'request': request,
                'puzzle': public_puzzle,
                'dumped_puzzle': public_puzzle.model_dump(mode='json'),
            },
        )

    return router
