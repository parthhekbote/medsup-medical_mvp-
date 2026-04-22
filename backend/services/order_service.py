from sqlalchemy.orm import Session
from ..models.all_models import Order, OrderStatus, AuditLog, MedicalSupply
from datetime import datetime

def create_order_request(db: Session, supply_id: int, quantity: int):
    new_order = Order(
        supply_id=supply_id,
        quantity=quantity,
        status=OrderStatus.PENDING
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

def process_order(db: Session, order_id: int, action: str, user_role: str = "Admin"):
    order = db.query(Order).get(order_id)
    if not order:
        return None
    
    # Audit Logging
    log = AuditLog(
        action_type="ORDER_PROCESS",
        description=f"Order #{order_id} for Supply #{order.supply_id} processed.",
        user_action=action, # APPROVE / REJECT
        timestamp=datetime.utcnow()
    )
    
    if action == "APPROVE":
        order.status = OrderStatus.APPROVED
        # Logic to update inventory could go here if "Approved" implies immediate arrival
        # But usually it's "Shipped" -> "Delivered". We'll just mark approved.
        log.description += " Status set to APPROVED."
    elif action == "REJECT":
        order.status = OrderStatus.REJECTED
        log.description += " Status set to REJECTED."
    
    db.add(log)
    db.commit()
    return order
