import logging
from sqlalchemy import Engine
from sqlmodel import Field, Relationship, SQLModel, Session, create_engine, select, text
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
