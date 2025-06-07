import logging
import datetime
from typing import Any
import uuid
from pydantic import BaseModel
from sqlalchemy import Column, Engine
from sqlmodel import JSON, Field, Relationship, SQLModel, create_engine, text
from rod_traad.config import SQLITE_DB


logger = logging.getLogger(__name__)


def create_db_and_tables(engine: Engine):
    SQLModel.metadata.create_all(engine)
    with engine.connect() as connection:
        # Enable foreign key constraints
        connection.execute(text('PRAGMA foreign_keys=ON'))


def setup_engine():
    sqlite_url = f'sqlite:///{SQLITE_DB}'

    connect_args = {'check_same_thread': False}
    engine = create_engine(sqlite_url, connect_args=connect_args)

    create_db_and_tables(engine)

    return engine


class Detail(BaseModel):
    detail: str


class Puzzle(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    date: datetime.date
    data: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))

    sessions: list["GameSession"] = Relationship(back_populates="puzzle")


class User(SQLModel, table=True):
    id: str | None = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    sessions: list["GameSession"] = Relationship(back_populates="user")


class GameSessionBase(SQLModel):
    user_id: str | None = Field(default=None, foreign_key="user.id")
    puzzle_id: int | None = Field(default=None, foreign_key="puzzle.id", nullable=False)

    start_time: datetime.datetime = Field(
        default_factory=lambda: datetime.datetime.now(datetime.UTC)
    )
    end_time: datetime.datetime | None = None


class GameSession(GameSessionBase, table=True):
    id: int | None = Field(default=None, primary_key=True)

    user: User | None = Relationship(back_populates="sessions")
    puzzle: Puzzle = Relationship(back_populates="sessions")
    guesses: list["Guess"] = Relationship(back_populates="session", cascade_delete=True)


class GameSessionUpdate(GameSessionBase):
    guesses: list["Guess"] | None = None


class GameSessionPublic(GameSessionBase):
    id: int = Field(default=None, primary_key=True)
    puzzle: Puzzle
    guesses: list["Guess"] = []


def is_game_session_won(
    session: GameSession | GameSessionPublic,
) -> bool:
    correct_guesses = sum(guess.correct for guess in session.guesses)
    return correct_guesses >= 4


def is_game_session_lost(
    session: GameSession | GameSessionPublic,
) -> bool:
    incorrect_guesses = sum(not guess.correct for guess in session.guesses)
    return incorrect_guesses >= 4


def is_game_session_complete(
    session: GameSession | GameSessionPublic,
) -> bool:
    return is_game_session_won(session) or is_game_session_lost(session)


class GuessBase(SQLModel):
    session_id: int = Field(foreign_key="gamesession.id")
    words: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    correct: bool


class Guess(GuessBase, table=True):
    id: int | None = Field(default=None, primary_key=True)

    session: GameSession = Relationship(back_populates="guesses")
