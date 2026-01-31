from database import sensor_collection, alerts_collection, predictions_collection
from health import compute_machine_health, compute_fleet_health
from datetime import datetime, timedelta

def build_machine_context(machine_id: str):
    """
    Build comprehensive context for a specific machine
    This is the retrieval step for RAG
    """
    # Get latest sensor reading
    latest_sensor = sensor_collection.find_one(
        {"machine_id": machine_id},
        {"_id": 0}
    )
    
    # Get last 10 sensor readings for trend analysis
    recent_readings = list(sensor_collection.find(
        {"machine_id": machine_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(10))
    
    # Get active alerts
    active_alerts = list(alerts_collection.find(
        {"machine_id": machine_id, "acknowledged": False},
        {"_id": 0}
    ).sort("created_at", -1))
    
    # Get latest prediction
    latest_prediction = predictions_collection.find_one(
        {"machine_id": machine_id},
        {"_id": 0}
    )
    
    # Get health metrics (uses your existing health computation)
    health_data = compute_machine_health(machine_id)
    
    # Calculate trend from recent readings
    if len(recent_readings) >= 5:
        recent_healths = []
        for r in recent_readings:
            h = float(r.get("health", 0))
            if h <= 1 and h > 0:
                h = h * 100
            recent_healths.append(h)
        
        health_trend = recent_healths[0] - recent_healths[-1]
        trend_direction = "improving" if health_trend > 2 else "declining" if health_trend < -2 else "stable"
    else:
        health_trend = 0
        trend_direction = "unknown"
    
    # Build comprehensive context
    context = {
        "machine_id": machine_id,
        
        # Current State
        "health_score": health_data["health_score"] if health_data else None,
        "status": health_data["status"] if health_data else "UNKNOWN",
        "anomaly_rate": health_data["anomaly_rate"] if health_data else None,
        
        # Latest Sensor Reading
        "latest_sensor": {
            "health": latest_sensor.get("health") if latest_sensor else None,
            "anomaly_score": latest_sensor.get("anomaly_score") if latest_sensor else None,
            "status": latest_sensor.get("status") if latest_sensor else None,
            "timestamp": latest_sensor.get("timestamp") if latest_sensor else None
        } if latest_sensor else None,
        
        # Trend Analysis
        "health_trend": health_trend,
        "trend_direction": trend_direction,
        "recent_readings_count": len(recent_readings),
        
        # Alerts
        "active_alerts_count": len(active_alerts),
        "critical_alerts_count": sum(1 for a in active_alerts if a.get("severity") == "CRITICAL"),
        "alerts": [
            {
                "severity": a.get("severity"),
                "message": a.get("message"),
                "predicted_hours": a.get("predicted_hours"),
                "confidence": a.get("confidence"),
                "created_at": str(a.get("created_at"))
            }
            for a in active_alerts[:5]  # Top 5 most recent
        ],
        
        # Prediction
        "prediction": {
            "failure_probability": latest_prediction.get("failure_probability"),
            "time_to_failure_hours": latest_prediction.get("time_to_failure_hours"),
            "confidence": latest_prediction.get("confidence"),
            "status": latest_prediction.get("status"),
            "timestamp": str(latest_prediction.get("timestamp"))
        } if latest_prediction else None,
        
        # AI Recommendations (if available)
        "ai_recommendations": latest_prediction.get("ai_recommendations", []) if latest_prediction else [],
        
        # Additional Metadata
        "data_points": health_data["data_points"] if health_data else 0,
        "last_updated": health_data["last_updated"] if health_data else None
    }
    
    return context

def build_fleet_context():
    """
    Build fleet-wide context for general questions
    """
    fleet_health = compute_fleet_health()
    
    # Get most critical machines
    critical_machines = [
        m for m in fleet_health.get("machines", [])
        if m["status"] == "CRITICAL"
    ][:5]
    
    # Get machines with most alerts
    high_alert_machines = sorted(
        fleet_health.get("machines", []),
        key=lambda x: x.get("unacknowledged_alerts", 0),
        reverse=True
    )[:5]
    
    context = {
        "fleet_overview": {
            "fleet_health": fleet_health.get("fleet_health"),
            "total_machines": fleet_health.get("total_machines"),
            "critical_machines": fleet_health.get("critical_machines"),
            "warning_machines": fleet_health.get("warning_machines"),
            "healthy_machines": fleet_health.get("healthy_machines"),
            "total_alerts": fleet_health.get("total_unacknowledged_alerts"),
            "critical_alerts": fleet_health.get("total_critical_alerts"),
            "avg_anomaly_rate": fleet_health.get("avg_anomaly_rate")
        },
        
        "critical_machines": [
            {
                "machine_id": m["machine_id"],
                "health_score": m["health_score"],
                "status": m["status"],
                "alerts": m["unacknowledged_alerts"]
            }
            for m in critical_machines
        ],
        
        "high_alert_machines": [
            {
                "machine_id": m["machine_id"],
                "health_score": m["health_score"],
                "alerts": m["unacknowledged_alerts"],
                "critical_alerts": m["critical_alerts"]
            }
            for m in high_alert_machines
        ],
        
        "all_machines": [
            {
                "machine_id": m["machine_id"],
                "health": m["health_score"],
                "status": m["status"],
                "alerts": m["unacknowledged_alerts"]
            }
            for m in fleet_health.get("machines", [])
        ]
    }
    
    return context

def format_context_for_ai(context: dict) -> str:
    """
    Format the context into a readable string for AI prompts
    """
    if "machine_id" in context:
        # Single machine context
        formatted = f"""Machine Status Report - {context['machine_id']}

CURRENT STATE:
- Health Score: {context['health_score']}%
- Status: {context['status']}
- Anomaly Rate: {context['anomaly_rate']}%
- Trend: {context['trend_direction']} ({context['health_trend']:+.1f}% change)

LATEST SENSOR READING:
"""
        if context['latest_sensor']:
            sensor = context['latest_sensor']
            formatted += f"""- Health: {sensor['health']}
- Anomaly Score: {sensor['anomaly_score']}
- Status: {sensor['status']}
- Timestamp: {sensor['timestamp']}
"""
        
        formatted += f"\nALERTS: {context['active_alerts_count']} active ({context['critical_alerts_count']} critical)\n"
        
        if context['alerts']:
            for alert in context['alerts'][:3]:
                formatted += f"- {alert['severity']}: {alert['message']} (confidence: {alert['confidence']}%)\n"
        
        if context['prediction']:
            pred = context['prediction']
            formatted += f"""\nLATEST PREDICTION:
- Failure Probability: {pred['failure_probability']*100:.1f}%
- Time to Failure: ~{pred['time_to_failure_hours']}h
- Status: {pred['status']}
- Confidence: {pred['confidence']}%
"""
        
        if context['ai_recommendations']:
            formatted += "\nRECOMMENDATIONS:\n"
            for i, rec in enumerate(context['ai_recommendations'][:3], 1):
                formatted += f"{i}. {rec}\n"
    
    else:
        # Fleet context
        fleet = context['fleet_overview']
        formatted = f"""Fleet Status Report

OVERVIEW:
- Fleet Health: {fleet['fleet_health']}%
- Total Machines: {fleet['total_machines']}
- Critical: {fleet['critical_machines']} | Warning: {fleet['warning_machines']} | Healthy: {fleet['healthy_machines']}
- Active Alerts: {fleet['total_alerts']} ({fleet['critical_alerts']} critical)
- Average Anomaly Rate: {fleet['avg_anomaly_rate']}%

CRITICAL MACHINES:
"""
        for m in context['critical_machines']:
            formatted += f"- {m['machine_id']}: {m['health_score']}% health, {m['alerts']} alerts\n"
        
        formatted += "\nHIGH ALERT MACHINES:\n"
        for m in context['high_alert_machines']:
            formatted += f"- {m['machine_id']}: {m['alerts']} alerts ({m['critical_alerts']} critical)\n"
    
    return formatted
