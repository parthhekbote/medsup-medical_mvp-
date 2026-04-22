from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from .database import get_db
from .models import MedicalSupply, Inventory, CriticalityEnum
from .logic import get_supply_status, RiskLevel, StockStatus
from .llm_service import generate_explainability_response

router = APIRouter()

# --- Pydantic Schemas ---
class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    response: str

class SupplyResponse(BaseModel):
    id: int
    name: str
    category: str
    criticality: str
    current_quantity: int
    stock_status: str
    risk_level: str

# --- Endpoints ---

@router.get("/supplies", response_model=List[SupplyResponse])
def list_supplies(db: Session = Depends(get_db)):
    supplies = db.query(MedicalSupply).all()
    results = []
    for s in supplies:
        status_data = get_supply_status(db, s.id)
        if status_data:
            results.append({
                "id": s.id,
                "name": s.name,
                "category": s.category,
                "criticality": s.criticality,
                "current_quantity": status_data["metrics"]["current_qty"],
                "stock_status": status_data["stock_status"],
                "risk_level": status_data["risk_level"]
            })
    return results

@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    # 1. Very basic Intent Recognition (Keyword based for MVP speed)
    query = request.query.lower()
    
    context_data = []
    deterministic_analysis = []
    
    # Global context fetching (naive) - fetch all critical items if asked generic questions
    # Or fetch specific item if named.
    
    supplies = db.query(MedicalSupply).all()
    # Simple search
    relevant_supplies = []
    for s in supplies:
        if s.name.lower() in query or "critical" in query or "risk" in query:
             status = get_supply_status(db, s.id)
             if status:
                 # If query asks for "critical", filter only critical/risk
                 if "critical" in query and status["stock_status"] != StockStatus.Critical:
                     continue
                 if "risk" in query and status["risk_level"] == RiskLevel.Safe:
                     continue
                     
                 relevant_supplies.append(status)
    
    # If no specific matches found but query seems general, might return top risk items
    if not relevant_supplies and ("status" in query or "summary" in query):
        for s in supplies:
             status = get_supply_status(db, s.id)
             if status and status["risk_level"] != RiskLevel.Safe:
                 relevant_supplies.append(status)

    # Serialize for LLM
    data_context = []
    for item in relevant_supplies:
        data_context.append({
            "supply": item["supply"].name,
            "current_qty": item["metrics"]["current_qty"],
            "avg_usage": item["metrics"]["avg_daily_usage"],
            "lead_time": item["metrics"]["lead_time"],
            "criticality": item["supply"].criticality,
            "stock_status": item["stock_status"],
            "risk_level": item["risk_level"]
        })
        deterministic_analysis.append(f"Supply: {item['supply'].name} is {item['risk_level']} Risk (Stock: {item['stock_status']})")

    # If absolutely nothing found
    if not data_context:
        return {"response": "I couldn't find specific data matching your query. Could you specify a supply name or ask about critical risks?"}

    # 2. Generate LLM Response
    response_text = generate_explainability_response(request.query, str(data_context), str(deterministic_analysis))
    
    return {"response": response_text}
