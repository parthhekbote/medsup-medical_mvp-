from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import inventory_routes, order_routes, ai_routes

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Medical Supply AIP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(inventory_routes.router, prefix="/api/inventory", tags=["Inventory"])
app.include_router(order_routes.router, prefix="/api/orders", tags=["Orders"])
app.include_router(ai_routes.router, prefix="/api/ai", tags=["AI"])

from .routes import accounting_routes
app.include_router(accounting_routes.router, prefix="/api/accounting", tags=["Accounting"])

from .routes import assistant_routes
app.include_router(assistant_routes.router, prefix="/api/assistant", tags=["Assistant"])

@app.get("/")
def home():
    return {"status": "Online", "system": "Medical Supply Operational AI"}
