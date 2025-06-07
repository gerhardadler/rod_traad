import os

import logging
from zoneinfo import ZoneInfo

logger = logging.getLogger(__name__)

SQLITE_DB = os.getenv('SQLITE_DB', 'database.db')
ADMIN_USERNAME = os.getenv('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'password')

TIMEZONE = ZoneInfo('Europe/Oslo')
