from .database import SessionLocal, engine, Base
from .models.all_models import MedicalSupply, Inventory, Usage, Supplier, Criticality, Customer, Transaction, TransactionType
import random
from datetime import date, timedelta

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Clear existing
    try:
        db.query(Transaction).delete()
        db.query(Customer).delete()
        db.query(Usage).delete()
        db.query(Inventory).delete()
        db.query(Supplier).delete()
        db.query(MedicalSupply).delete()
        db.commit()
    except Exception as e:
        print(f"Error clearing DB: {e}")
        db.rollback()

    print("Seeding Expanded Medical Data...")

    # (Name, Category, Criticality, InitialStock, AvgUse, Department)
    seed_supplies = [
        # Critical / ER
        ("Oxygen Tanks", "Gas", Criticality.HIGH, 4, 3, "ER"), # CRITICAL (< 2 days)
        ("Adrenaline (Epinephrine)", "Meds", Criticality.HIGH, 15, 2, "ER"), # WARNING (< 1 week)
        ("Trauma Kits", "Equipment", Criticality.HIGH, 50, 1, "ER"), # HEALTHY
        
        # ICU
        ("Ventilator Tubing", "Consumables", Criticality.HIGH, 12, 5, "ICU"), # CRITICAL
        ("Propofol 20ml", "Meds", Criticality.HIGH, 30, 8, "ICU"), # WARNING
        ("Fentanyl Patches", "Meds", Criticality.HIGH, 100, 2, "ICU"), # HEALTHY
        
        # General Ward / PPE
        ("N95 Respirators", "PPE", Criticality.HIGH, 500, 20, "General"), # HEALTHY
        ("Surgical Masks", "PPE", Criticality.MEDIUM, 1000, 50, "General"), # HEALTHY
        ("Nitrile Gloves (Box)", "PPE", Criticality.LOW, 200, 10, "General"), # HEALTHY
        ("Isolation Gowns", "PPE", Criticality.MEDIUM, 40, 15, "General"), # WARNING
        
        # Pharmacy
        ("Amoxicillin 500mg", "Meds", Criticality.MEDIUM, 60, 25, "Pharmacy"), # WARNING
        ("Paracetamol 500mg", "Meds", Criticality.LOW, 500, 30, "Pharmacy"), # HEALTHY
        ("IV Saline 1L", "Fluids", Criticality.MEDIUM, 80, 12, "Pharmacy"), # HEALTHY
        ("Insulin Pens", "Meds", Criticality.HIGH, 25, 3, "Pharmacy"), # HEALTHY
        ("Syringes 10ml", "Consumables", Criticality.LOW, 300, 20, "Pharmacy") # HEALTHY
    ]

    for name, cat, crit, stock, avg_use, dept in seed_supplies:
        s = MedicalSupply(name=name, category=cat, criticality=crit)
        db.add(s)
        db.commit()
        db.refresh(s)

        # Inventory
        inv = Inventory(supply_id=s.id, quantity=stock, department=dept)
        db.add(inv)

        # Supplier
        sup = Supplier(supply_id=s.id, lead_time_days=random.randint(1, 14), reliability_score=random.uniform(0.8, 1.0))
        db.add(sup)

        # Usage History (Generate synthetic variation around avg_use)
        for i in range(14):
            daily_use = max(0, int(random.gauss(avg_use, avg_use * 0.2))) # Gaussian distribution
            u = Usage(
                supply_id=s.id, 
                department=dept, 
                date=date.today() - timedelta(days=i), 
                units_used=daily_use
            )
            db.add(u)
    
    db.commit()

    print("Seeding Expanded Accounting Data...")
    
    seed_customers = [
        ("City Central Hospital", "billing@citycentral.org"),
        ("Green Valley Clinic", "accounts@greenvalley.com"),
        ("Hope Community Center", "admin@hopehealth.org"),
        ("Dr. Smith Private Practice", "smith@private.com"),
        ("Sunrise Aged Care", "finance@sunrise.com")
    ]

    for i, (c_name, c_email) in enumerate(seed_customers):
        cust = Customer(name=c_name, email=c_email, phone=f"555-010{i}")
        db.add(cust)
        db.commit()
        db.refresh(cust)
        
        # Generate random number of transactions per customer
        num_sales = random.randint(1, 5)
        
        for _ in range(num_sales):
            # SALE
            amt = random.randint(1000, 50000)
            cost = int(amt * random.uniform(0.6, 0.9)) # 10-40% profit margin
            
            # Occasional Loss (e.g. discount/expiry)
            if random.random() < 0.1: 
                cost = int(amt * 1.1)

            t_sale = Transaction(
                customer_id=cust.id, 
                type=TransactionType.SALE, 
                amount=amt, 
                cost_amount=cost
            )
            cust.total_debit += amt
            db.add(t_sale)

            # PAYMENT (Partial or Full)
            if random.random() > 0.3: # 70% chance they paid something
                pay_amt = int(amt * random.uniform(0.5, 1.0))
                t_pay = Transaction(
                    customer_id=cust.id, 
                    type=TransactionType.PAYMENT, 
                    amount=pay_amt
                )
                cust.total_credit += pay_amt
                db.add(t_pay)
        
        cust.current_balance = cust.total_debit - cust.total_credit
        db.add(cust)

    db.commit()
    db.close()
    print("Seed Complete.")

if __name__ == "__main__":
    seed()
