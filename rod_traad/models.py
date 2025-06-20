import logging
import datetime
import tomllib
from typing import Annotated, Any
import uuid
from pydantic import AfterValidator, BaseModel, BeforeValidator, Json, PlainSerializer
from sqlalchemy import Column, DateTime, Engine
from sqlmodel import JSON, Field, Relationship, SQLModel, create_engine, text
from rod_traad.config import SQLITE_DB


logger = logging.getLogger(__name__)


def setup_engine():
    sqlite_url = f'sqlite:///{SQLITE_DB}'

    connect_args = {'check_same_thread': False}
    engine = create_engine(sqlite_url, connect_args=connect_args)

    return engine


def empty_string_to_none(value: Any) -> Any:
    if isinstance(value, str) and value.strip() == "":
        return None
    return value


def aware_convert(value: datetime.datetime | None) -> datetime.datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=datetime.UTC)


AwareConvertDatetime = Annotated[
    datetime.datetime | None,
    AfterValidator(aware_convert),
]


class Detail(BaseModel):
    detail: str


class PuzzleBase(SQLModel):
    date: datetime.date
    data: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))


class Puzzle(PuzzleBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    number: int | None = Field(default=None, nullable=True, unique=True)
    sessions: list["GameSession"] = Relationship(back_populates="puzzle")


class PuzzleUpdate(PuzzleBase):
    number: Annotated[int | None, BeforeValidator(empty_string_to_none)] = None
    date: datetime.date
    data: Json[dict[str, Any]] = Field(default_factory=dict)


class User(SQLModel, table=True):
    id: str | None = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    sessions: list["GameSession"] = Relationship(back_populates="user")


class GameSessionBase(SQLModel):
    user_id: str | None = Field(default=None, foreign_key="user.id")
    puzzle_id: int | None = Field(default=None, foreign_key="puzzle.id", nullable=False)

    start_time: AwareConvertDatetime = Field(
        default_factory=lambda: datetime.datetime.now(datetime.UTC)
    )
    end_time: AwareConvertDatetime | None = None


class GameSession(GameSessionBase, table=True):
    id: int | None = Field(default=None, primary_key=True)

    user: User | None = Relationship(back_populates="sessions")
    puzzle: Puzzle = Relationship(back_populates="sessions")
    guesses: list["Guess"] = Relationship(back_populates="session", cascade_delete=True)


class GameSessionUpdate(GameSessionBase):
    guesses: list["Guess"]


class GameSessionPublic(GameSessionBase):
    id: int = Field(default=None, primary_key=True)
    puzzle: Puzzle
    guesses: list["Guess"] = []


def is_game_session_won(
    session: GameSession | GameSessionPublic | GameSessionUpdate,
) -> bool:
    correct_guesses = sum(1 if guess.correct else 0 for guess in session.guesses)
    return correct_guesses >= 4


def is_game_session_lost(
    session: GameSession | GameSessionPublic | GameSessionUpdate,
) -> bool:
    incorrect_guesses = sum(1 if not guess.correct else 0 for guess in session.guesses)
    return incorrect_guesses >= 4


def is_game_session_complete(
    session: GameSession | GameSessionPublic | GameSessionUpdate,
) -> bool:
    return is_game_session_won(session) or is_game_session_lost(session)


class GuessBase(SQLModel):
    session_id: int = Field(foreign_key="gamesession.id")
    words: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    correct: bool


class Guess(GuessBase, table=True):
    id: int | None = Field(default=None, primary_key=True)

    session: GameSession = Relationship(back_populates="guesses")
