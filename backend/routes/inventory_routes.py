from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..services import inventory_service

router = APIRouter()

@router.get("/status")
def get_status(db: Session = Depends(get_db)):
    return inventory_service.get_inventory_status(db)
