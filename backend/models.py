from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, Enum
from sqlalchemy.orm import relationship
import enum
from  .database import Base

class CriticalityEnum(str, enum.Enum):
    Low = "Low"
    Medium = "Medium"
    High = "High"

class MedicalSupply(Base):
    __tablename__ = "medical_supplies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String)
    criticality = Column(String) # Stored as string, validated as Enum in Pydantic

    inventory = relationship("Inventory", back_populates="supply", uselist=False)
    usage_history = relationship("UsageHistory", back_populates="supply")
    suppliers = relationship("Supplier", back_populates="supply")
    orders = relationship("Order", back_populates="supply")

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    supply_id = Column(Integer, ForeignKey("medical_supplies.id"), unique=True)
    department = Column(String, default="General") # Or specific location
    current_quantity = Column(Integer, default=0)

    supply = relationship("MedicalSupply", back_populates="inventory")

class UsageHistory(Base):
    __tablename__ = "usage_history"

    id = Column(Integer, primary_key=True, index=True)
    supply_id = Column(Integer, ForeignKey("medical_supplies.id"))
    department = Column(String)
    date = Column(Date)
    units_used = Column(Integer)

    supply = relationship("MedicalSupply", back_populates="usage_history")

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    supply_id = Column(Integer, ForeignKey("medical_supplies.id"))
    name = Column(String)
    lead_time_days = Column(Integer)
    reliability_score = Column(Float) # 0.0 to 1.0 or 1-10

    supply = relationship("MedicalSupply", back_populates="suppliers")

class OrderStatusEnum(str, enum.Enum):
    Pending = "Pending"
    Approved = "Approved"
    Shipped = "Shipped"
    Delivered = "Delivered"

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    supply_id = Column(Integer, ForeignKey("medical_supplies.id"))
    quantity = Column(Integer)
    status = Column(String, default="Pending")
    order_date = Column(Date)

    supply = relationship("MedicalSupply", back_populates="orders")
