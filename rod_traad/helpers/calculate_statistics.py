from collections import defaultdict
from dataclasses import dataclass

from sqlmodel import Session, col, func, select

from rod_traad.models import GameSession, Guess, Puzzle, is_game_session_won


@dataclass
class Statistics:
    game_sessions_count: int
    won_game_sessions_count: int
    completed_game_sessions_count: int
    solve_rate: float | None
    mistake_count_distribution: dict[int, float]


def _calculate_mistake_count_distribution(completed_game_sessions: list[GameSession]):
    mistake_count_distribution: dict[int, float] = {
        0: 0.0,
        1: 0.0,
        2: 0.0,
        3: 0.0,
        4: 0.0,
    }
    for game_session in completed_game_sessions:
        incorrect_guesses = sum(
            1 for guess in game_session.guesses if not guess.correct
        )
        mistake_count_distribution[incorrect_guesses] += 1

    for key in mistake_count_distribution:
        mistake_count_distribution[key] = mistake_count_distribution[key] / len(
            completed_game_sessions
        )

    return mistake_count_distribution


def calculate_statistics(session: Session, puzzle: Puzzle) -> Statistics:
    query = (
        select(GameSession)
        .where(GameSession.puzzle_id == puzzle.id)
        .join(Guess)
        .group_by(col(GameSession.id))
        # only started sessions are interesting
        .having(func.count(col(Guess.id)) > 0)
    )
    game_sessions = session.exec(query).all()

    won_game_sessions: list[GameSession] = []
    completed_game_sessions: list[GameSession] = []

    for game_session in game_sessions:
        if game_session.end_time is None:
            continue

        completed_game_sessions.append(game_session)
        if is_game_session_won(game_session):
            won_game_sessions.append(game_session)

    solve_rate = (
        (len(won_game_sessions) / len(completed_game_sessions))
        if completed_game_sessions
        else None
    )

    mistake_count_distribution = _calculate_mistake_count_distribution(
        completed_game_sessions
    )

    return Statistics(
        game_sessions_count=len(game_sessions),
        won_game_sessions_count=len(won_game_sessions),
        completed_game_sessions_count=len(completed_game_sessions),
        solve_rate=solve_rate,
        mistake_count_distribution=mistake_count_distribution,
    )
