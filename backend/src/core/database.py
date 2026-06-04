from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker
from src.core.config import settings

# Create a DB engine
engine = create_engine(settings.database_url, echo=False)

# Create a declarative base
Base = declarative_base()

# Create a session
SessionLocal = sessionmaker(bind=engine)


def get_session():
    with SessionLocal() as session:
        yield session


@contextmanager
def transactional(session: Session):
    try:
        yield
        session.commit()
    except Exception:
        session.rollback()
        raise


def create_filter(filter_dict: dict):
    _filter = {
        key: value
        for key, value in filter_dict.items()
        if value or (isinstance(value, bool) and value is False)
    }

    return _filter


def apply_filter(stmt, filter_dict, model):
    for key, value in filter_dict.items():
        # Apply standard filters
        if hasattr(model, key):
            stmt = stmt.where(getattr(model, key) == value)
            continue

        # Apply comparison filters (lt, lte, gt, gte etc.)
        if "_" not in key:
            continue

        column_name, operator = key.rsplit("_", 1)

        if hasattr(model, column_name):
            if operator == "lt":
                stmt = stmt.where(getattr(model, column_name) < value)
            elif operator == "lte":
                stmt = stmt.where(getattr(model, column_name) <= value)
            elif operator == "eq":
                stmt = stmt.where(getattr(model, column_name) == value)
            elif operator == "gt":
                stmt = stmt.where(getattr(model, column_name) > value)
            elif operator == "gte":
                stmt = stmt.where(getattr(model, column_name) >= value)
            elif operator == "btw":
                stmt = stmt.where(
                    getattr(model, column_name).between(value[0], value[1])
                )

    return stmt
