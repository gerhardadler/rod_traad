from datetime import datetime
import tomllib

from pydantic import BaseModel

from rod_traad.config import TIMEZONE


class PuzzleData(BaseModel):
    author: str

    grid: list[list[str]]
    solutions: dict[str, list[str]]


def get_puzzle(date: datetime.date):
    """
    Fetch the puzzle for the given date.
    """
    with open(f"puzzles/{date}.toml", "rb") as file:
        puzzle_data = tomllib.load(file)

    return PuzzleData.model_validate(puzzle_data)


def get_puzzle_today():
    """
    Fetch the puzzle for today.
    """
    return get_puzzle(datetime.now(TIMEZONE).date())
