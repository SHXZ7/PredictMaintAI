from fastapi import APIRouter, HTTPException
from database import alerts_collection, sensor_collection
from datetime import datetime, timedelta
from bson import ObjectId
import random

router = APIRouter()

def generate_alert(machine_id: str, prediction: dict):
    """
    Generate alert based on prediction
    INDUSTRY-GRADE: More conservative thresholds
    """
    hours_to_failure = prediction.get("hours_to_failure", 100)
    confidence = prediction.get("confidence", 0.5)
    
    # STRICTER CONDITIONS for alert generation
    # Only generate if confidence is high enough
    if confidence < 0.65:
        return None  # Don't alert on low-confidence predictions
    
    # Determine severity based on lead time AND confidence
    if hours_to_failure <= 12 and confidence > 0.80:  # Imminent failure with high confidence
        severity = "CRITICAL"
    elif hours_to_failure <= 24 and confidence > 0.75:  # Within 24 hours with good confidence
        severity = "CRITICAL"
    elif hours_to_failure <= 48 and confidence > 0.70:  # Within 48 hours
        severity = "WARNING"
    elif hours_to_failure <= 72:  # Within 72 hours
        severity = "WARNING"
    else:
        return None  # No alert needed for >72 hours
    
    # SEVERITY ESCALATION: Check for repeated warnings (more conservative)
    if severity == "WARNING":
        now = datetime.utcnow()
        recent_warnings = alerts_collection.count_documents({
            "machine_id": machine_id,
            "severity": "WARNING",
            "created_at": {"$gte": now - timedelta(hours=6)}  # Changed from 2 to 6 hours
        })
        
        # Only escalate if 5+ warnings (not 3+)
        if recent_warnings >= 5:
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
    
    # Check for duplicate alerts WITHIN LAST 60 MINUTES (increased from 30)
    time_threshold = datetime.utcnow() - timedelta(minutes=60)
    
    existing = alerts_collection.find_one({
        "machine_id": machine_id,
        "severity": severity,
        "acknowledged": False,
        "created_at": {"$gte": time_threshold}
    })
    
    if not existing:
        result = alerts_collection.insert_one(alert)
        alert["_id"] = str(result.inserted_id)
        print(f"🚨 Alert generated: {severity} for {machine_id} (hours_to_failure: {hours_to_failure}, confidence: {confidence:.0%})")
        return alert
    else:
        print(f"⏭️ Skipping duplicate alert for {machine_id} (recent alert exists within 60min)")
    
    return None

def analyze_machine_health(machine_id: str):
    """
    Analyze recent sensor data and generate predictions
    MORE REALISTIC model for industry
    """
    # Get last 50 readings for the machine
    cursor = sensor_collection.find(
        {"machine_id": machine_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(50)
    
    data = list(cursor)
    
    if len(data) < 10:
        return None  # Not enough data
    
    # Calculate health trend with SMOOTHING
    health_values = []
    for d in data:
        h = float(d.get("health", 0))
        if h <= 1 and h > 0:
            h = h * 100
        health_values.append(h)
    
    avg_health = sum(health_values) / len(health_values)
    recent_health = sum(health_values[:10]) / 10  # Last 10 readings
    health_decline = avg_health - recent_health
    
    # Calculate anomaly rate with HIGHER threshold
    anomaly_scores = [float(d.get("anomaly_score", 0)) for d in data]
    high_anomalies = sum(1 for a in anomaly_scores if a > 0.7)  # Changed from 0.5 to 0.7
    anomaly_rate = high_anomalies / len(anomaly_scores)
    max_anomaly = max(anomaly_scores) if anomaly_scores else 0
    
    # REALISTIC CONFIDENCE CALCULATION
    # Start with lower base confidence
    anomaly_confidence = min(85, int(max_anomaly * 90))  # Reduced from 95 to 85
    health_confidence = min(85, int((100 - recent_health) * 0.8))  # Reduced multiplier
    trend_confidence = min(75, int(abs(health_decline) * 2.5))  # Reduced from 3
    
    # Weighted average with LOWER overall confidence
    confidence = (anomaly_confidence * 0.4 + health_confidence * 0.35 + trend_confidence * 0.25) / 100
    confidence = max(0.45, min(0.88, confidence))  # Clamp between 45% and 88% (not 95%)
    
    # INDUSTRY-STANDARD Predictive logic
    if recent_health < 30 and anomaly_rate > 0.4:  # Both conditions must be true
        hours_to_failure = random.randint(8, 18)
        confidence = max(confidence, 0.80)
    elif recent_health < 45 and anomaly_rate > 0.3:
        hours_to_failure = random.randint(18, 36)
        confidence = max(confidence, 0.70)
    elif recent_health < 55 or anomaly_rate > 0.25:
        hours_to_failure = random.randint(36, 60)
    elif health_decline > 15:
        hours_to_failure = random.randint(48, 96)
    else:
        hours_to_failure = random.randint(96, 168)  # 4-7 days
        confidence = min(confidence, 0.65)  # Lower confidence for stable
    
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
