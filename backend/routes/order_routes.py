from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from ..services import order_service

router = APIRouter()

class OrderRequest(BaseModel):
    supply_id: int
    quantity: int

class OrderAction(BaseModel):
    order_id: int
    action: str # APPROVE or REJECT

@router.post("/request")
def create_order(request: OrderRequest, db: Session = Depends(get_db)):
    return order_service.create_order_request(db, request.supply_id, request.quantity)

@router.post("/process")
def process_order(action: OrderAction, db: Session = Depends(get_db)):
    order = order_service.process_order(db, action.order_id, action.action)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Processed", "status": order.status}
