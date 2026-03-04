import os
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine

def get_engine() -> Engine:
    dsn = os.getenv(
        "DB_DSN",
        "mysql+pymysql://root:1234@localhost:3306/evido?charset=utf8mb4"
    )
    return create_engine(dsn, pool_pre_ping=True, future=True)