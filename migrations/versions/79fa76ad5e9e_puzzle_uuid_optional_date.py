"""puzzle_id -> uuid + optional date

Revision ID: 79fa76ad5e9e
Revises: cced3305974a
Create Date: 2025-06-22 16:36:57.544593

"""

from typing import Sequence, Union
import uuid

from alembic import op
import sqlalchemy as sa
import sqlmodel

from rod_traad.models import generate_random_id


# revision identifiers, used by Alembic.
revision: str = '79fa76ad5e9e'
down_revision: Union[str, None] = 'cced3305974a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###

    op.add_column('puzzle', sa.Column('uuid', sa.String(), nullable=True))
    op.add_column('gamesession', sa.Column('puzzle_uuid', sa.String(), nullable=True))

    # Update existing rows with random UUIDs
    conn = op.get_bind()
    puzzles = conn.execute(sa.text("SELECT id FROM puzzle")).fetchall()
    for row in puzzles:
        new_uuid = generate_random_id()
        conn.execute(
            sa.text("UPDATE puzzle SET uuid = :uuid WHERE id = :id"),
            {"uuid": new_uuid, "id": row.id},
        )
        conn.execute(
            sa.text("UPDATE gamesession SET puzzle_uuid = :uuid WHERE puzzle_id = :id"),
            {"uuid": new_uuid, "id": row.id},
        )

    with op.batch_alter_table('gamesession') as batch_op:
        batch_op.alter_column('start_time', nullable=True)
        batch_op.drop_column('puzzle_id')
        batch_op.alter_column(
            'puzzle_uuid', new_column_name='puzzle_id', nullable=False
        )

    with op.batch_alter_table('puzzle') as batch_op:
        # Make the column non-nullable
        batch_op.alter_column('date', nullable=True)
        batch_op.drop_column('id')
        batch_op.alter_column('uuid', new_column_name='id', nullable=False)

    with op.batch_alter_table('puzzle') as batch_op:
        batch_op.create_primary_key(None, ['id'])

    with op.batch_alter_table('gamesession') as batch_op:
        batch_op.create_foreign_key(None, 'puzzle', ['puzzle_id'], ['id'])

    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    raise NotImplementedError("Downgrade is not implemented for this migration.")
    # ### end Alembic commands ###
