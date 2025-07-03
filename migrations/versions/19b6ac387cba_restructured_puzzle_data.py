"""Restructured puzzle data

Revision ID: 19b6ac387cba
Revises: 79fa76ad5e9e
Create Date: 2025-07-02 12:50:58.358569

"""

import datetime
import itertools
import json
from typing import Any, Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import Integer
import sqlmodel
from sqlalchemy.dialects import sqlite

from rod_traad.models import (
    GameSession,
    Guess,
    GuessBase,
    Puzzle,
    PuzzleBase,
    Solution,
    Word,
)

# revision identifiers, used by Alembic.
revision: str = '19b6ac387cba'
down_revision: Union[str, None] = '79fa76ad5e9e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

temporary_metadata = sa.MetaData()


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'solution',
        sa.Column('name', sqlmodel.AutoString(), nullable=False),
        sa.Column('difficulty', sa.Integer(), nullable=False),
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('puzzle_id', sqlmodel.AutoString(), nullable=False),
        sa.ForeignKeyConstraint(
            ['puzzle_id'], ['puzzle.id'], name=op.f('fk_solution_puzzle_id_puzzle')
        ),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_solution')),
    )
    with op.batch_alter_table('solution', schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f('ix_solution_difficulty'), ['difficulty'], unique=False
        )
        batch_op.create_index(batch_op.f('ix_solution_name'), ['name'], unique=False)

    op.create_table(
        'word',
        sa.Column('word', sqlmodel.AutoString(), nullable=False),
        sa.Column('position', sa.Integer(), nullable=False),
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('puzzle_id', sqlmodel.AutoString(), nullable=False),
        sa.Column('solution_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ['puzzle_id'], ['puzzle.id'], name=op.f('fk_word_puzzle_id_puzzle')
        ),
        sa.ForeignKeyConstraint(
            ['solution_id'], ['solution.id'], name=op.f('fk_word_solution_id_solution')
        ),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_word')),
    )
    with op.batch_alter_table('word', schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f('ix_word_position'), ['position'], unique=False
        )
        batch_op.create_index(batch_op.f('ix_word_word'), ['word'], unique=False)

    op.create_table(
        'guesswordlink',
        sa.Column('guess_id', sa.Integer(), nullable=False),
        sa.Column('word_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ['guess_id'], ['guess.id'], name=op.f('fk_guesswordlink_guess_id_guess')
        ),
        sa.ForeignKeyConstraint(
            ['word_id'], ['word.id'], name=op.f('fk_guesswordlink_word_id_word')
        ),
        sa.PrimaryKeyConstraint('guess_id', 'word_id', name=op.f('pk_guesswordlink')),
    )

    class OldPuzzle(sqlmodel.SQLModel, table=True):
        __tablename__ = 'puzzle'
        metadata = temporary_metadata

        id: str | None = sqlmodel.Field(default=None, primary_key=True)
        number: int | None = sqlmodel.Field(default=None, nullable=True, unique=True)
        data: dict[str, Any] = sqlmodel.Field(
            default_factory=dict, sa_column=sqlmodel.Column(sqlmodel.JSON)
        )
        date: datetime.date | None

    class OldGuess(sqlmodel.SQLModel, table=True):
        __tablename__ = 'guess'
        metadata = temporary_metadata

        id: int | None = sqlmodel.Field(default=None, primary_key=True)
        session_id: int = sqlmodel.Field(foreign_key="gamesession.id")
        words: list[str] = sqlmodel.Field(
            default_factory=list, sa_column=sqlmodel.Column(sqlmodel.JSON)
        )
        correct: bool = sqlmodel.Field(default=False)

    conn = op.get_bind()
    session = sqlmodel.Session(conn)
    old_puzzles = session.exec(sqlmodel.select(OldPuzzle)).all()
    old_guesses = session.exec(sqlmodel.select(OldGuess)).all()

    with op.batch_alter_table('puzzle', schema=None) as batch_op:
        batch_op.create_unique_constraint(batch_op.f('uq_puzzle_number'), ['number'])
        batch_op.drop_column('data')

    with op.batch_alter_table('guess', schema=None) as batch_op:
        batch_op.add_column(sa.Column('solution_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            batch_op.f('fk_guess_solution_id_solution'),
            'solution',
            ['solution_id'],
            ['id'],
        )
        batch_op.drop_column('words')
        batch_op.drop_column('correct')

    for puzzle in old_puzzles:
        all_words = itertools.chain.from_iterable(puzzle.data['grid'])

        all_word_entries = []

        words_data = {}
        for pos, word in enumerate(all_words):
            words_data[word] = {
                'word': word,
                'position': pos,
                'puzzle_id': puzzle.id,
            }

        for i, (solution_name, solution_words) in enumerate(
            puzzle.data['solutions'].items()
        ):
            new_words = [Word(**words_data[word]) for word in solution_words]
            all_word_entries += new_words
            # Create a new solution for each puzzle
            new_solution = Solution(
                name=solution_name,
                difficulty=i,
                puzzle_id=puzzle.id,
                words=new_words,
            )
            session.add(new_solution)

    for old_guess in old_guesses:
        # Create a new guess for each old guess
        word_entries = []

        # solution_id will be int if all words in the guess have the same solution,
        # otherwise it will be None (unknown is just an initial value)
        solution_id = 'unknown'

        for word in old_guess.words:
            word_entry = session.exec(
                sqlmodel.select(Word)
                .join(Puzzle)
                .join(GameSession)
                .where(Word.word == word)
                .where(GameSession.id == old_guess.session_id)
                .where(Word.puzzle_id == Puzzle.id)
            ).first()
            if word_entry is None:
                continue

            word_entries.append(word_entry)
            if solution_id == 'unknown' or word_entry.solution_id == solution_id:
                solution_id = word_entry.solution_id
            else:
                solution_id = None

        if solution_id == 'unknown':
            # If no solution_id was found, something is wrong, skip
            continue

        new_guess = Guess(
            id=old_guess.id,
            session_id=old_guess.session_id,
            words=word_entries,
            solution_id=solution_id,
        )
        session.merge(new_guess)

    session.commit()

    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    raise NotImplementedError("Downgrade is not implemented for this migration.")
