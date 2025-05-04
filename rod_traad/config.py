import os

import logging
from zoneinfo import ZoneInfo

logger = logging.getLogger(__name__)

SQLITE_DB = os.getenv('SQLITE_DB', 'database.db')

TIMEZONE = ZoneInfo('Europe/Oslo')
