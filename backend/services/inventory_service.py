from sqlalchemy.orm import Session
from ..models.all_models import MedicalSupply, Inventory, Usage, Supplier, StockStatus, RiskLevel, Criticality

def calculate_stock_status(current_qty: int, avg_daily_usage: float, lead_time_days: int) -> StockStatus:
    if avg_daily_usage <= 0:
        return StockStatus.HEALTHY

    # Rule: If quantity < avg_daily_usage × supplier_lead_time → CRITICAL
    if current_qty < (avg_daily_usage * lead_time_days):
        return StockStatus.CRITICAL
    
    # Rule: If quantity < avg_daily_usage × 2 → LOW (Implicit rule from previous spec, keeping for sensing)
    if current_qty < (avg_daily_usage * 2):
        return StockStatus.LOW
        
    return StockStatus.HEALTHY

def assess_risk(criticality: str, stock_status: StockStatus) -> RiskLevel:
    # Rule: If criticality = HIGH and stock = CRITICAL → EMERGENCY
    if criticality == Criticality.HIGH and stock_status == StockStatus.CRITICAL:
        return RiskLevel.EMERGENCY
    
    # Rule: If criticality = MEDIUM and stock = CRITICAL → WARNING
    if criticality == Criticality.MEDIUM and stock_status == StockStatus.CRITICAL:
        return RiskLevel.WARNING
            
    return RiskLevel.SAFE

def get_inventory_status(db: Session):
    supplies = db.query(MedicalSupply).all()
    results = []
    
    for s in supplies:
        # Calculate Usage
        # Simplified: Get average of all usage records for now
        # Ideally: filter by last 14 days
        usage_records = s.usage
        total_used = sum(u.units_used for u in usage_records)
        day_count = len(set(u.date for u in usage_records)) or 1
        avg_usage = total_used / day_count if total_used > 0 else 0
        
        # Get Lead Time (Max of suppliers or default 7)
        lead_time = max([sup.lead_time_days for sup in s.suppliers]) if s.suppliers else 7
        
        current_qty = s.inventory.quantity if s.inventory else 0
        
        stock_stat = calculate_stock_status(current_qty, avg_usage, lead_time)
        risk_lvl = assess_risk(s.criticality, stock_stat)
        
        results.append({
            "supply_id": s.id,
            "name": s.name,
            "department": s.inventory.department if s.inventory else "General",
            "quantity": current_qty,
            "stock_status": stock_stat,
            "risk_level": risk_lvl,
            "details": {
                "avg_usage": round(avg_usage, 2),
                "lead_time": lead_time
            }
        })
    return results
