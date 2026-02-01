from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth import router as auth_router
from history import router as history_router
from alerts import router as alerts_router
from predict import router as predict_router
from ai_chat import router as chat_router
from report_generator import router as report_router
from health import compute_machine_health, compute_fleet_health
from history_loader import load_history
from database import sensor_collection

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def preload_history():
    data = load_history()
    if sensor_collection.count_documents({}) == 0:
        sensor_collection.insert_many(data)

app.include_router(auth_router, prefix="/api")
app.include_router(history_router, prefix="/api")
app.include_router(alerts_router, prefix="/api")
app.include_router(predict_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(report_router, prefix="/api")

@app.get("/")
def root():
    return {"status": "Backend running"}

@app.get("/api/health")
def get_health_dashboard():
    """Get comprehensive fleet health dashboard"""
    return compute_fleet_health()

@app.get("/api/health/{machine_id}")
def get_machine_health(machine_id: str):
    """Get detailed health metrics for a specific machine"""
    data = compute_machine_health(machine_id)
    if data:
        return data
    return {"error": "Machine not found or insufficient data"}
