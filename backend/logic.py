from .models import MedicalSupply, Inventory, UsageHistory, Supplier, CriticalityEnum, Order
from sqlalchemy.orm import Session
from datetime import date, timedelta
import enum

class StockStatus(str, enum.Enum):
    Healthy = "Healthy"
    Low = "Low"
    Critical = "Critical"

class RiskLevel(str, enum.Enum):
    Safe = "Safe"
    Warning = "Warning"
    Emergency = "Emergency"

def get_average_daily_usage(db: Session, supply_id: int, days: int = 30) -> float:
    cutoff_date = date.today() - timedelta(days=days)
    usage_records = db.query(UsageHistory).filter(
        UsageHistory.supply_id == supply_id,
        UsageHistory.date >= cutoff_date
    ).all()
    
    total_used = sum(r.units_used for r in usage_records)
    # Avoid division by zero if no history, default to 1 for safety or 0 if strictly data-driven
    # If days < 1 (shouldn't happen), avoid error.
    return total_used / days if days > 0 else 0

def calculate_stock_status(current_qty: int, avg_daily_usage: float, lead_time_days: int) -> StockStatus:
    if avg_daily_usage <= 0:
        return StockStatus.Healthy # No usage, no risk? Or treat as safe.

    # Strict Rules
    # If current_quantity < (average_daily_usage × supplier_lead_time) → Critical
    if current_quantity < (avg_daily_usage * lead_time_days):
        return StockStatus.Critical
    
    # If current_quantity < (average_daily_usage × 2) → Low
    if current_quantity < (avg_daily_usage * 2):
        return StockStatus.Low
        
    return StockStatus.Healthy

def assess_risk(criticality: str, stock_status: StockStatus) -> RiskLevel:
    # Logic:
    # High + Critical -> Emergency
    # Medium + Critical -> Warning
    # Else... (Need to infer 'Safe' or other cases)
    
    if stock_status == StockStatus.Critical:
        if criticality == CriticalityEnum.High:
            return RiskLevel.Emergency
        if criticality == CriticalityEnum.Medium:
            return RiskLevel.Warning
            
    # Additional implicit logic for other states could be added here
    # For now, default to Safe unless flagged
    return RiskLevel.Safe

def get_supply_status(db: Session, supply_id: int):
    supply = db.query(MedicalSupply).filter(MedicalSupply.id == supply_id).first()
    if not supply or not supply.inventory:
        return None

    inventory = supply.inventory
    # Get primary supplier lead time (avg or max? Rules say "supplier_lead_time", implying one. Let's take the first or max)
    # Assuming one supplier for MVP simplicity or max lead time for safety
    supplier = supply.suppliers[0] if supply.suppliers else None
    lead_time = supplier.lead_time_days if supplier else 7 # Default 7 if no supplier data
    
    avg_usage = get_average_daily_usage(db, supply_id)
    
    stock_status = calculate_stock_status(inventory.current_quantity, avg_usage, lead_time)
    risk_level = assess_risk(supply.criticality, stock_status)
    
    return {
        "supply": supply,
        "stock_status": stock_status,
        "risk_level": risk_level,
        "metrics": {
            "current_qty": inventory.current_quantity,
            "avg_daily_usage": avg_usage,
            "lead_time": lead_time
        }
    }
