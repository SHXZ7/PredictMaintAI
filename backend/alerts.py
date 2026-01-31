from fastapi import APIRouter, HTTPException
from database import alerts_collection, sensor_collection
from datetime import datetime, timedelta
from bson import ObjectId
import random

router = APIRouter()

def generate_alert(machine_id: str, prediction: dict):
    """
    Generate alert based on prediction
    Satisfies: Lead time, Predictive alerting, Precision control
    """
    hours_to_failure = prediction.get("hours_to_failure", 100)
    confidence = prediction.get("confidence", 0.5)
    
    # Determine base severity based on lead time
    if hours_to_failure <= 24:
        severity = "CRITICAL"
    elif hours_to_failure <= 48:
        severity = "WARNING"
    else:
        return None  # No alert needed for >48 hours
    
    # SEVERITY ESCALATION: Check for repeated warnings
    # If machine has 3+ WARNING alerts in last 2 hours, escalate to CRITICAL
    if severity == "WARNING":
        now = datetime.utcnow()
        recent_warnings = alerts_collection.count_documents({
            "machine_id": machine_id,
            "severity": "WARNING",
            "created_at": {"$gte": now - timedelta(hours=2)}
        })
        
        if recent_warnings >= 3:
            severity = "CRITICAL"
            print(f"⚠️➡️🔴 Escalating {machine_id} to CRITICAL due to {recent_warnings} recent warnings")
    
    # Create alert document
    alert = {
        "machine_id": machine_id,
        "severity": severity,
        "message": f"Failure predicted within {hours_to_failure} hours",
        "predicted_hours": hours_to_failure,
        "confidence": round(confidence, 3),
        "created_at": datetime.utcnow(),
        "acknowledged": False
    }
    
    # Check for duplicate alerts WITHIN LAST 30 MINUTES (time-based re-alerting)
    # This allows the same alert to reappear if condition persists
    time_threshold = datetime.utcnow() - timedelta(minutes=30)
    
    existing = alerts_collection.find_one({
        "machine_id": machine_id,
        "severity": severity,
        "acknowledged": False,
        "created_at": {"$gte": time_threshold}
    })
    
    if not existing:
        result = alerts_collection.insert_one(alert)
        alert["_id"] = str(result.inserted_id)
        print(f"🚨 Alert generated: {severity} for {machine_id} (hours_to_failure: {hours_to_failure})")
        return alert
    else:
        print(f"⏭️ Skipping duplicate alert for {machine_id} (recent alert exists within 30min)")
    
    return None

def analyze_machine_health(machine_id: str):
    """
    Analyze recent sensor data and generate predictions
    This is a simplified predictive model
    """
    # Get last 50 readings for the machine
    cursor = sensor_collection.find(
        {"machine_id": machine_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(50)
    
    data = list(cursor)
    
    if len(data) < 10:
        return None  # Not enough data
    
    # Calculate health trend
    health_values = []
    for d in data:
        h = float(d.get("health", 0))
        if h <= 1 and h > 0:
            h = h * 100
        health_values.append(h)
    
    avg_health = sum(health_values) / len(health_values)
    recent_health = sum(health_values[:10]) / 10  # Last 10 readings
    health_decline = avg_health - recent_health
    
    # Calculate anomaly rate
    anomaly_scores = [float(d.get("anomaly_score", 0)) for d in data]
    high_anomalies = sum(1 for a in anomaly_scores if a > 0.5)
    anomaly_rate = high_anomalies / len(anomaly_scores)
    max_anomaly = max(anomaly_scores) if anomaly_scores else 0
    
    # DYNAMIC CONFIDENCE CALCULATION
    # Base confidence on multiple factors
    anomaly_confidence = min(95, int(max_anomaly * 100))  # Higher anomaly = higher confidence
    health_confidence = min(95, int((100 - recent_health) * 0.9))  # Lower health = higher confidence
    trend_confidence = min(95, int(abs(health_decline) * 3))  # Bigger decline = higher confidence
    
    # Weighted average of confidence factors
    confidence = (anomaly_confidence * 0.5 + health_confidence * 0.3 + trend_confidence * 0.2) / 100
    confidence = max(0.5, min(0.95, confidence))  # Clamp between 50% and 95%
    
    # Predictive logic
    if recent_health < 30 or anomaly_rate > 0.6:
        hours_to_failure = random.randint(6, 24)
        # Boost confidence for critical conditions
        confidence = max(confidence, 0.80)
    elif recent_health < 50 or anomaly_rate > 0.4:
        hours_to_failure = random.randint(24, 48)
        confidence = max(confidence, 0.65)
    elif health_decline > 20:
        hours_to_failure = random.randint(36, 72)
    else:
        hours_to_failure = random.randint(72, 120)
        # Lower confidence for stable conditions
        confidence = min(confidence, 0.70)
    
    return {
        "machine_id": machine_id,
        "hours_to_failure": hours_to_failure,
        "confidence": round(confidence, 3),
        "current_health": recent_health,
        "anomaly_rate": anomaly_rate
    }

@router.get("/alerts")
def get_alerts(acknowledged: bool = None):
    """Get all alerts, optionally filtered by acknowledged status"""
    query = {}
    if acknowledged is not None:
        query["acknowledged"] = acknowledged
    
    # Include _id in results
    cursor = alerts_collection.find(query).sort("created_at", -1)
    
    # Convert ObjectId to string for JSON serialization
    alerts = []
    for alert in cursor:
        alert["_id"] = str(alert["_id"])
        alert["created_at"] = str(alert["created_at"])
        if "acknowledged_at" in alert:
            alert["acknowledged_at"] = str(alert["acknowledged_at"])
        alerts.append(alert)
    
    return alerts

@router.post("/alerts/{alert_id}/ack")
def acknowledge_alert(alert_id: str):
    """Acknowledge an alert - unlocks ability to create new alerts for same machine"""
    try:
        result = alerts_collection.update_one(
            {"_id": ObjectId(alert_id)},
            {"$set": {
                "acknowledged": True, 
                "acknowledged_at": datetime.utcnow()
            }}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        print(f"✅ Alert {alert_id} acknowledged - new alerts can now be generated")
        
        return {"status": "success", "message": "Alert acknowledged"}
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/alerts/check")
def check_all_machines():
    """
    Check all machines and generate alerts if needed
    This should be called periodically (e.g., every 5 minutes)
    """
    # Get all unique machines
    machines = sensor_collection.distinct("machine_id")
    
    alerts_generated = []
    
    for machine_id in machines:
        prediction = analyze_machine_health(machine_id)
        
        if prediction:
            alert = generate_alert(machine_id, prediction)
            if alert:
                alerts_generated.append(alert)
    
    return {
        "status": "success",
        "machines_checked": len(machines),
        "alerts_generated": len(alerts_generated),
        "alerts": alerts_generated
    }

@router.get("/alerts/summary")
def get_alerts_summary():
    """Get summary statistics for alerts"""
    total_alerts = alerts_collection.count_documents({})
    critical_alerts = alerts_collection.count_documents({"severity": "CRITICAL", "acknowledged": False})
    warning_alerts = alerts_collection.count_documents({"severity": "WARNING", "acknowledged": False})
    
    return {
        "total_alerts": total_alerts,
        "unacknowledged_critical": critical_alerts,
        "unacknowledged_warning": warning_alerts
    }

@router.get("/alerts/by-prediction/{prediction_id}")
def get_alerts_by_prediction(prediction_id: str):
    """Get alerts linked to a specific prediction"""
    alerts = list(alerts_collection.find(
        {"prediction_id": prediction_id},
        {"_id": 0}
    ).sort("created_at", -1))
    
    for alert in alerts:
        alert["created_at"] = str(alert["created_at"])
        if "acknowledged_at" in alert:
            alert["acknowledged_at"] = str(alert["acknowledged_at"])
    
    return {
        "prediction_id": prediction_id,
        "alerts_count": len(alerts),
        "alerts": alerts
    }

@router.get("/alerts/automated")
def get_automated_alerts():
    """Get all automatically generated alerts from predictions"""
    cursor = alerts_collection.find(
        {"source": "automated_prediction"},
        {"_id": 0}
    ).sort("created_at", -1).limit(50)
    
    alerts = []
    for alert in cursor:
        alert["created_at"] = str(alert["created_at"])
        if "acknowledged_at" in alert:
            alert["acknowledged_at"] = str(alert["acknowledged_at"])
        alerts.append(alert)
    
    return {
        "count": len(alerts),
        "alerts": alerts
    }
