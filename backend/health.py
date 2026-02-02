from database import sensor_collection, predictions_collection, alerts_collection
from datetime import datetime, timedelta
import os
import requests
from dotenv import load_dotenv

load_dotenv()

def generate_health_explanation(machine_data: dict) -> str:
    """
    Generate AI-powered explanation of machine health status
    """
    try:
        openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
        
        if not openrouter_api_key:
            return generate_rule_based_explanation(machine_data)
        
        prompt = f"""You are an industrial maintenance expert. Provide a brief, clear explanation of this machine's health status.

Machine: {machine_data['machine_id']}
Current Health Score: {machine_data['health_score']}%
Status: {machine_data['status']}
Health Trend: {machine_data['health_trend']}% ({"improving" if machine_data['health_trend'] > 0 else "declining" if machine_data['health_trend'] < 0 else "stable"})
Anomaly Rate: {machine_data['anomaly_rate']}%
Active Alerts: {machine_data['unacknowledged_alerts']}

In 2-3 sentences, explain what's happening with this machine and why. Be concise and actionable."""

        free_models = [
              "tngtech/tng-r1t-chimera:free",
    "z-ai/glm-4.5-air:free",
    "arcee-ai/trinity-large-preview:free",
    "deepseek/deepseek-r1t-chimera:free"
    "arcee-ai/trinity-large-preview:free",
    "mistralai/mistral-7b-instruct",
    "mistralai/mixtral-8x7b-instruct",

    # LLaMA-based strong general models
    "nvidia/nemotron-3-nano-30b-a3b:free",
    "allenai/molmo-2-8b:free",

    # Good for longer reasoning / explanations
    "huggingfaceh4/zephyr-7b-beta",
    "togethercomputer/redpajama-incite-chat-3b",

    # Code + reasoning friendly
    "deepseek-ai/deepseek-coder-6.7b-instruct",
    "codellama/codellama-7b-instruct",

    # Lightweight / fast (lower cost, quick replies)
    "google/gemma-7b-it",
    "tiiuae/falcon-7b-instruct",
        ]
        
        for model_name in free_models:
            try:
                response = requests.post(
                    url="https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {openrouter_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": model_name,
                        "messages": [
                            {"role": "system", "content": "You are a concise industrial maintenance expert."},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 150
                    },
                    timeout=10
                )
                
                if response.status_code == 200:
                    result = response.json()
                    explanation = result["choices"][0]["message"]["content"].strip()
                    if len(explanation) > 20:
                        return explanation
            except:
                continue
        
        return generate_rule_based_explanation(machine_data)
        
    except:
        return generate_rule_based_explanation(machine_data)

def generate_rule_based_explanation(machine_data: dict) -> str:
    """Fallback rule-based explanation"""
    machine_id = machine_data['machine_id']
    health = machine_data['health_score']
    trend = machine_data['health_trend']
    status = machine_data['status']
    anomaly_rate = machine_data['anomaly_rate']
    alerts = machine_data['unacknowledged_alerts']
    
    if status == "CRITICAL":
        explanation = f"{machine_id} is in critical condition with {health}% health. "
        if alerts > 0:
            explanation += f"There are {alerts} active alerts requiring immediate attention. "
        if trend < -5:
            explanation += f"Health is declining rapidly ({trend}%). Emergency maintenance recommended."
        else:
            explanation += "Immediate inspection and corrective action required to prevent failure."
            
    elif status == "WARNING":
        explanation = f"{machine_id} shows warning signs with {health}% health. "
        if anomaly_rate > 20:
            explanation += f"High anomaly rate ({anomaly_rate}%) indicates irregular operation. "
        if trend < -3:
            explanation += f"Health is declining ({trend}%). Schedule maintenance within 48 hours."
        else:
            explanation += "Monitor closely and plan preventive maintenance soon."
            
    else:  # HEALTHY
        explanation = f"{machine_id} is operating normally at {health}% health. "
        if trend > 3:
            explanation += f"Health is improving ({trend}%). Recent maintenance appears effective."
        else:
            explanation += "Continue regular monitoring and maintenance schedule."
    
    return explanation

def compute_machine_health(machine_id: str):
    """
    Compute comprehensive health metrics for a specific machine
    Returns health score, anomaly rate, recent status, predictions, and AI explanation
    """
    # Get last 50 readings for the machine
    cursor = sensor_collection.find(
        {"machine_id": machine_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(50)
    
    data = list(cursor)
    
    if len(data) < 5:
        return None  # Not enough data
    
    # Calculate health metrics with SMOOTHING to avoid extreme values
    health_values = []
    for d in data:
        h = float(d.get("health", 0))
        if h <= 1 and h > 0:
            h = h * 100
        health_values.append(h)
    
    # Use weighted average - recent readings have more weight but not extreme
    avg_health = sum(health_values) / len(health_values)
    recent_health = sum(health_values[:10]) / min(10, len(health_values))
    
    # SMOOTHED health score - 70% recent, 30% historical average
    smoothed_health = (recent_health * 0.7) + (avg_health * 0.3)
    
    health_trend = recent_health - avg_health  # Positive = improving, Negative = degrading
    
    # Calculate anomaly metrics with REALISTIC thresholds
    anomaly_scores = [float(d.get("anomaly_score", 0)) for d in data]
    avg_anomaly = sum(anomaly_scores) / len(anomaly_scores)
    
    # Only count SIGNIFICANT anomalies (>0.7 instead of >0.5)
    high_anomalies = sum(1 for a in anomaly_scores if a > 0.7)
    anomaly_rate = (high_anomalies / len(anomaly_scores)) * 100
    
    # Get most recent status
    recent_status = data[0].get("status", "UNKNOWN") if data else "UNKNOWN"
    
    # Count recent alerts
    recent_alerts = alerts_collection.count_documents({
        "machine_id": machine_id,
        "acknowledged": False
    })
    
    critical_alerts = alerts_collection.count_documents({
        "machine_id": machine_id,
        "severity": "CRITICAL",
        "acknowledged": False
    })
    
    # Get latest prediction if available
    latest_prediction = predictions_collection.find_one(
        {"machine_id": machine_id},
        {"_id": 0, "failure_probability": 1, "time_to_failure_hours": 1, "timestamp": 1}
    )
    
    # INDUSTRY-STANDARD STATUS DETERMINATION
    # Critical: Only if multiple severe conditions exist
    # Warning: One or two concerning conditions
    # Healthy: Normal operating range
    
    critical_conditions = 0
    warning_conditions = 0
    
    # Check each condition independently
    if smoothed_health < 35:
        critical_conditions += 1
    elif smoothed_health < 55:
        warning_conditions += 1
    
    if anomaly_rate > 35:  # More than 35% anomalies
        critical_conditions += 1
    elif anomaly_rate > 20:  # More than 20% anomalies
        warning_conditions += 1
    
    if critical_alerts > 2:  # Multiple critical alerts
        critical_conditions += 1
    elif critical_alerts > 0 or recent_alerts > 3:
        warning_conditions += 1
    
    # Determine status based on conditions
    if critical_conditions >= 2:  # At least 2 critical conditions
        overall_status = "CRITICAL"
    elif critical_conditions >= 1 or warning_conditions >= 2:  # 1 critical OR 2 warnings
        overall_status = "WARNING"
    else:
        overall_status = "HEALTHY"
    
    result = {
        "machine_id": machine_id,
        "health_score": round(smoothed_health, 1),
        "avg_health": round(avg_health, 1),
        "health_trend": round(health_trend, 1),
        "anomaly_rate": round(anomaly_rate, 1),
        "avg_anomaly": round(avg_anomaly, 3),
        "status": overall_status,
        "recent_status": recent_status,
        "unacknowledged_alerts": recent_alerts,
        "critical_alerts": critical_alerts,
        "data_points": len(data),
        "latest_prediction": latest_prediction,
        "last_updated": str(data[0].get("timestamp")) if data else None
    }
    
    # Add AI-powered health explanation
    result["explanation"] = generate_health_explanation(result)
    
    return result

def compute_fleet_health():
    """
    Compute aggregated health metrics for entire fleet
    """
    machines = sensor_collection.distinct("machine_id")
    
    results = []
    for machine in machines:
        data = compute_machine_health(machine)
        if data:
            results.append(data)
    
    if not results:
        return {
            "fleet_health": 0,
            "total_machines": 0,
            "machines": []
        }
    
    # Calculate fleet-wide metrics
    fleet_health = round(
        sum(m["health_score"] for m in results) / len(results), 1
    )
    
    critical_count = sum(1 for m in results if m["status"] == "CRITICAL")
    warning_count = sum(1 for m in results if m["status"] == "WARNING")
    healthy_count = sum(1 for m in results if m["status"] == "HEALTHY")
    
    total_alerts = sum(m["unacknowledged_alerts"] for m in results)
    total_critical_alerts = sum(m["critical_alerts"] for m in results)
    
    avg_anomaly_rate = round(
        sum(m["anomaly_rate"] for m in results) / len(results), 1
    )
    
    return {
        "fleet_health": fleet_health,
        "total_machines": len(results),
        "critical_machines": critical_count,
        "warning_machines": warning_count,
        "healthy_machines": healthy_count,
        "total_unacknowledged_alerts": total_alerts,
        "total_critical_alerts": total_critical_alerts,
        "avg_anomaly_rate": avg_anomaly_rate,
        "machines": sorted(results, key=lambda x: x["health_score"])
    }
