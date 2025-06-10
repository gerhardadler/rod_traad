import os
from dotenv import load_dotenv

from zoneinfo import ZoneInfo


dotenv_path = os.path.join(os.path.dirname(__file__), '../.env')
load_dotenv(dotenv_path)

SQLITE_DB = os.getenv('SQLITE_DB', 'database.db')
ADMIN_USERNAME = os.getenv('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'password')

TIMEZONE = ZoneInfo('Europe/Oslo')
