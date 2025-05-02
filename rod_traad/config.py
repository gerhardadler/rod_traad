import os

import logging

logger = logging.getLogger(__name__)

SQLITE_DB = os.getenv('SQLITE_DB', 'database.db')
