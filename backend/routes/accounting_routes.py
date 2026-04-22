from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from ..database import get_db
from ..services import accounting_service
from ..models.all_models import TransactionType

router = APIRouter()

# Schemas
class CustomerCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None

class TransactionCreate(BaseModel):
    customer_id: Optional[int] = None
    type: str # SALE, PAYMENT, or WASTE
    amount: float = 0.0
    cost_amount: float = 0.0

@router.post("/customers")
def add_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    return accounting_service.create_customer(db, customer.name, customer.phone, customer.email)

@router.get("/customers")
def list_customers(db: Session = Depends(get_db)):
    customers = accounting_service.get_customers(db)
    return [
        {
            "id": c.id, 
            "name": c.name, 
            "balance": round(c.current_balance, 2), 
            "debit": round(c.total_debit, 2), 
            "credit": round(c.total_credit, 2)
        } 
        for c in customers
    ]

@router.post("/transactions")
def add_transaction(txn: TransactionCreate, db: Session = Depends(get_db)):
    # Validate Type
    if txn.type not in [TransactionType.SALE, TransactionType.PAYMENT, TransactionType.WASTE]:
        raise HTTPException(status_code=400, detail="Invalid transaction type")
        
    if txn.type in [TransactionType.SALE, TransactionType.PAYMENT] and txn.customer_id is None:
        raise HTTPException(status_code=400, detail="Customer ID is required for SALES and PAYMENTS")
        
    result = accounting_service.record_transaction(db, txn.customer_id, txn.type, txn.amount, txn.cost_amount)
    if not result:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"status": "Recorded", "new_balance": "Updated"}

@router.get("/summary")
def get_finance_stats(db: Session = Depends(get_db)):
    return accounting_service.get_financial_summary(db)
