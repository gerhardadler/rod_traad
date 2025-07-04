import json
import logging
import datetime
import random
from typing import Annotated, Any, Self
import uuid
from pydantic import AfterValidator, BaseModel, BeforeValidator, Json, model_validator
from sqlalchemy import Column
from sqlmodel import JSON, Field, Relationship, SQLModel, create_engine
from rod_traad.config import SQLITE_DB


logger = logging.getLogger(__name__)

SQLModel.metadata.naming_convention = {
    "ix": "ix_%(table_name)s_%(column_0_name)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


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


def generate_random_id(length: int = 8) -> str:
    """Generate a random alphanumeric string of fixed length."""
    allowed_chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return ''.join(random.choice(allowed_chars) for _ in range(length))


AwareConvertDatetime = Annotated[
    datetime.datetime | None,
    AfterValidator(aware_convert),
]


class BaseTable(SQLModel):
    @model_validator(mode="before")
    @classmethod
    def validate_types(cls, data: Any) -> Any:
        # Dynamically loop through model fields
        for field_name, field in cls.model_fields.items():
            field_type = field.annotation
            try:
                value = data.get(field_name)
            except AttributeError:
                value = getattr(data, field_name, None)

        return data


class Detail(BaseModel):
    detail: str


class GuessWordLink(SQLModel, table=True):
    guess_id: int = Field(foreign_key="guess.id", primary_key=True)
    word_id: int = Field(foreign_key="word.id", primary_key=True)


class PuzzleBase(BaseTable):
    date: datetime.date | None
    number: int | None = Field(default=None, nullable=True, unique=True)


class Puzzle(PuzzleBase, table=True):
    id: str | None = Field(default_factory=generate_random_id, primary_key=True)
    sessions: list["GameSession"] = Relationship(back_populates="puzzle")

    words: list["Word"] = Relationship(
        back_populates="puzzle",
        cascade_delete=True,
    )
    solutions: list["Solution"] = Relationship(
        back_populates="puzzle",
        cascade_delete=True,
    )


class PuzzleUpdate(PuzzleBase):
    id: str
    number: Annotated[int | None, BeforeValidator(empty_string_to_none)] = None
    date: datetime.date | None
    # words: Json[list["Word"]] = []
    solutions: Json[list["SolutionUpdate"]] = []


class PuzzleCreate(PuzzleBase):
    number: Annotated[int | None, BeforeValidator(empty_string_to_none)] = None
    date: datetime.date | None
    solutions: Json[list["SolutionCreate"]] = []


class PuzzlePublic(PuzzleBase):
    id: str | None = None
    words: list["Word"] = []
    solutions: list["SolutionPublic"] = []


class WordBase(SQLModel):
    word: str = Field(default="", nullable=False, index=True)
    position: int = Field(default=0, nullable=False, index=True)


class Word(WordBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    puzzle_id: str | None = Field(default=None, foreign_key="puzzle.id", nullable=False)
    solution_id: int | None = Field(
        default=None, foreign_key="solution.id", nullable=False
    )

    puzzle: Puzzle = Relationship(back_populates="words")
    solution: "Solution" = Relationship(back_populates="words")

    guesses: list["Guess"] = Relationship(
        back_populates="words",
        link_model=GuessWordLink,
    )


class WordUpdate(WordBase):
    id: int
    pass


class WordCreate(WordBase):
    pass


class WordPublic(WordBase):
    id: int | None = None
    pass


class SolutionBase(SQLModel):
    name: str = Field(default="", nullable=False, index=True)
    difficulty: int = Field(default=0, nullable=False, index=True)


class Solution(SolutionBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    puzzle_id: str | None = Field(default=None, foreign_key="puzzle.id", nullable=False)

    words: list[Word] = Relationship(back_populates="solution", cascade_delete=True)
    puzzle: Puzzle = Relationship(back_populates="solutions")
    guesses: list["Guess"] = Relationship(
        back_populates="solution", cascade_delete=True
    )


class SolutionCreate(SolutionBase):
    words: list[WordCreate] = []


class SolutionUpdate(SolutionBase):
    id: int
    puzzle_id: str
    words: list[WordUpdate] = []


class SolutionPublic(SolutionBase):
    id: int | None = None
    words: list[WordPublic] = []


class User(SQLModel, table=True):
    id: str | None = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    sessions: list["GameSession"] = Relationship(back_populates="user")


class GameSessionBase(SQLModel):
    user_id: str | None = Field(default=None, foreign_key="user.id")
    puzzle_id: str | None = Field(default=None, foreign_key="puzzle.id", nullable=False)

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
    solution_id: int | None = Field(
        default=None, foreign_key="solution.id", nullable=True
    )

    @property
    def correct(self) -> bool:
        return self.solution_id is not None


class Guess(GuessBase, table=True):
    id: int | None = Field(default=None, primary_key=True)

    session: GameSession = Relationship(back_populates="guesses")
    words: list["Word"] = Relationship(
        back_populates="guesses",
        link_model=GuessWordLink,
    )
    solution: Solution | None = Relationship(back_populates="guesses")
