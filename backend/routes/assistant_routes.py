from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from ..services import inventory_service
from ..ai import llm_service

router = APIRouter()

class AssistantMessage(BaseModel):
    message: str

@router.post("/message")
def chat_assistant(msg: AssistantMessage, db: Session = Depends(get_db)):
    # 1. Fetch current context
    inventory_data = inventory_service.get_inventory_status(db)
    
    # 2. Optimize context (Send core fields)
    optimized_context = [
        {
            "name": i["name"], 
            "qty": i["quantity"], 
            "status": i["stock_status"], 
            "risk": i["risk_level"]
        } for i in inventory_data
    ]
    
    # 3. Call LLM
    response_data = llm_service.analyze_query(msg.message, optimized_context)
    
    # Map 'response' to 'reply' as expected by frontend assistant.js
    return {"reply": response_data.get("response", "Error processing request.")}
