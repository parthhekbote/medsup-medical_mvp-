from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime, Enum, Text
from sqlalchemy.orm import relationship, declarative_base
import enum
from datetime import datetime
from ..database import Base

class Criticality(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class StockStatus(str, enum.Enum):
    HEALTHY = "HEALTHY"
    LOW = "LOW"
    CRITICAL = "CRITICAL"

class RiskLevel(str, enum.Enum):
    SAFE = "SAFE"
    WARNING = "WARNING"
    EMERGENCY = "EMERGENCY"

class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class MedicalSupply(Base):
    __tablename__ = "supplies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String)
    criticality = Column(String) # Stored as string to allow flexible query, enforced via logic

    inventory = relationship("Inventory", back_populates="supply", uselist=False)
    usage = relationship("Usage", back_populates="supply")
    suppliers = relationship("Supplier", back_populates="supply")
    orders = relationship("Order", back_populates="supply")

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    supply_id = Column(Integer, ForeignKey("supplies.id"), unique=True)
    department = Column(String, default="General")
    quantity = Column(Integer, default=0)

    supply = relationship("MedicalSupply", back_populates="inventory")

class Usage(Base):
    __tablename__ = "usage"

    id = Column(Integer, primary_key=True, index=True)
    supply_id = Column(Integer, ForeignKey("supplies.id"))
    department = Column(String)
    date = Column(Date)
    units_used = Column(Integer)

    supply = relationship("MedicalSupply", back_populates="usage")

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    supply_id = Column(Integer, ForeignKey("supplies.id"))
    lead_time_days = Column(Integer)
    reliability_score = Column(Float)

    supply = relationship("MedicalSupply", back_populates="suppliers")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    supply_id = Column(Integer, ForeignKey("supplies.id"))
    quantity = Column(Integer)
    status = Column(String, default=OrderStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)

    supply = relationship("MedicalSupply", back_populates="orders")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action_type = Column(String) # e.g. "ORDER_APPROVAL", "SYSTEM_ALERT"
    description = Column(Text)
    user_action = Column(String, nullable=True) # "APPROVE", "REJECT", etc.
    ai_recommendation = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class TransactionType(str, enum.Enum):
    SALE = "SALE"
    PAYMENT = "PAYMENT"
    WASTE = "WASTE"

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String)
    email = Column(String)
    total_debit = Column(Float, default=0.0)
    total_credit = Column(Float, default=0.0)
    current_balance = Column(Float, default=0.0) # debit - credit

    transactions = relationship("Transaction", back_populates="customer")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    type = Column(String) # SALE, PAYMENT, or WASTE
    amount = Column(Float) # Selling amount or 0 for WASTE
    cost_amount = Column(Float, default=0.0) # Cost of goods
    transaction_date = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="transactions")
