from fastapi import Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session
from src.core.database import get_session
