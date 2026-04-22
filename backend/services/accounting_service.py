from sqlalchemy.orm import Session
from ..models.all_models import Customer, Transaction, TransactionType
from sqlalchemy import func

def create_customer(db: Session, name: str, phone: str = None, email: str = None):
    customer = Customer(name=name, phone=phone, email=email)
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

def get_customers(db: Session):
    return db.query(Customer).all()

def record_transaction(db: Session, customer_id: int = None, type: str = "SALE", amount: float = 0.0, cost: float = 0.0):
    if type == TransactionType.WASTE:
        txn = Transaction(
            customer_id=None,
            type=type,
            amount=0.0,
            cost_amount=cost
        )
        db.add(txn)
        db.commit()
        db.refresh(txn)
        return txn

    customer = db.query(Customer).get(customer_id)
    if not customer:
        return None

    # Logic:
    # SALE: Increase Debit. Benefit = Amount - Cost.
    # PAYMENT: Increase Credit. Decrease Balance.
    
    if type == TransactionType.SALE:
        customer.total_debit += amount
        # Balance = Debit - Credit
        customer.current_balance = customer.total_debit - customer.total_credit
    elif type == TransactionType.PAYMENT:
        customer.total_credit += amount
        customer.current_balance = customer.total_debit - customer.total_credit

    # Record transaction
    txn = Transaction(
        customer_id=customer_id,
        type=type,
        amount=amount,
        cost_amount=cost
    )
    db.add(txn)
    db.add(customer) # Update balance
    db.commit()
    db.refresh(txn)
    return txn

def get_financial_summary(db: Session):
    # Profit = SUM(amount - cost) WHERE (amount - cost) > 0 on SALES
    # Loss = SUM(ABS(amount - cost)) WHERE (amount - cost) < 0 on SALES
    
    sales = db.query(Transaction).filter(Transaction.type == TransactionType.SALE).all()
    wastes = db.query(Transaction).filter(Transaction.type == TransactionType.WASTE).all()
    
    total_profit = 0.0
    total_loss = 0.0
    
    for sale in sales:
        margin = sale.amount - sale.cost_amount
        if margin >= 0:
            total_profit += margin
        else:
            total_loss += abs(margin)
            
    for waste in wastes:
        total_loss += waste.cost_amount
            
    return {
        "total_profit": round(total_profit, 2),
        "total_loss": round(total_loss, 2)
    }
