from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from ..services import inventory_service
from ..ai import llm_service

router = APIRouter()

class ChatQuery(BaseModel):
    query: str

@router.post("/query")
def ask_ai(request: ChatQuery, db: Session = Depends(get_db)):
    # 1. Fetch current context
    inventory_data = inventory_service.get_inventory_status(db)
    
    # 2. Optimize context (don't send EVERYTHING if too huge, but for MVP send all)
    # Just sending core fields to save tokens
    optimized_context = [
        {
            "name": i["name"], 
            "qty": i["quantity"], 
            "status": i["stock_status"], 
            "risk": i["risk_level"]
        } for i in inventory_data
    ]
    
    # 3. Call LLM
    response = llm_service.analyze_query(request.query, optimized_context)
    return response
