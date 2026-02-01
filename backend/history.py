from fastapi import APIRouter, Query
from history_loader import load_history
from database import sensor_collection
from datetime import datetime, timedelta
import random
from constants import MACHINES
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

@router.post("/sensor")
def ingest_sensor(data: dict):
    # Use machine_id from request if provided, otherwise random
    machine_id = data.get("machine_id")
    if not machine_id:
        machine_id = random.choice(MACHINES)
    
    sensor_collection.insert_one({
        "machine_id": machine_id,
        "timestamp": datetime.utcnow(),
        "health": float(data["health"]),
        "anomaly_score": float(data["anomaly"]),
        "status": data["status"]
    })
    return {"status": "success", "message": "Sensor data ingested", "machine_id": machine_id}

@router.get("/history")
def get_history(limit: int = 300):
    cursor = (
        sensor_collection
        .find({}, {"_id": 0})
        .sort("timestamp", -1)
        .limit(limit)
    )

    data = list(cursor)
    data.reverse()  # oldest → newest
    
    # Ensure proper formatting
    for row in data:
        if "health" in row:
            health_val = row["health"]
            if isinstance(health_val, str):
                health_val = health_val.replace("%", "")
            row["health"] = float(health_val)
        
        if "anomaly_score" in row:
            row["anomaly_score"] = float(row["anomaly_score"])
    
    return data

@router.get("/history/status")
def get_status_summary():
    # Read from MongoDB instead of pickle
    cursor = (
        sensor_collection
        .find({}, {"_id": 0, "status": 1})
        .sort("timestamp", -1)
        .limit(5)
    )
    
    recent_data = list(cursor)
    last_5 = [row.get("status", "UNKNOWN") for row in recent_data]

    escalation = None
    if last_5.count("WARNING") >= 3:
        escalation = "ESCALATE_TO_CRITICAL"

    return {
        "last_statuses": last_5,
        "escalation": escalation
    }

@router.get("/trends")
def get_trends(
    machine_id: str = Query(None),
    hours: int = Query(24)
):
    """
    Get trend data for visualization
    Supports both fleet-wide and machine-specific queries
    """
    query = {}
    
    # If machine_id is provided, filter by it
    if machine_id:
        # Validate machine exists
        count = sensor_collection.count_documents({"machine_id": machine_id})
        if count == 0:
            # Machine has no data yet, return empty array
            return []
        query["machine_id"] = machine_id
    
    # Calculate time threshold
    time_threshold = datetime.utcnow() - timedelta(hours=hours)
    query["timestamp"] = {"$gte": time_threshold}
    
    # Fetch data sorted by timestamp
    cursor = sensor_collection.find(
        query, 
        {"_id": 0, "machine_id": 1, "health": 1, "anomaly_score": 1, "status": 1, "timestamp": 1}
    ).sort("timestamp", 1).limit(hours * 60)  # Limit to reasonable size
    
    data = list(cursor)
    
    # Convert timestamps to strings for JSON serialization
    for item in data:
        if "timestamp" in item:
            item["timestamp"] = str(item["timestamp"])
    
    return data

@router.get("/trends/summary")
def get_trends_summary(
    machine_id: str,
    hours: int = 24
):
    """Get trend data with statistical summary"""
    since = datetime.utcnow() - timedelta(hours=hours)

    cursor = sensor_collection.find(
        {
            "machine_id": machine_id,
            "timestamp": {"$gte": str(since)}
        },
        {"_id": 0}
    ).sort("timestamp", 1)

    data = list(cursor)
    summary = summarize_trend(data)
    
    return {
        "machine_id": machine_id,
        "hours": hours,
        "data_points": len(data),
        "summary": summary,
        "data": data
    }

@router.get("/machines")
def get_machines():
    machines = sensor_collection.distinct("machine_id")
    return machines

def summarize_trend(data):
    """Convert raw trend data into meaningful summary statistics"""
    if not data or len(data) == 0:
        return {
            "health_start": 0,
            "health_end": 0,
            "health_change": 0,
            "avg_anomaly": 0,
            "max_anomaly": 0,
            "anomaly_spikes": 0,
            "duration_points": 0
        }
    
    health_values = [float(d.get("health", 0)) for d in data]
    anomaly_values = [float(d.get("anomaly_score", 0)) for d in data]

    summary = {
        "health_start": round(health_values[0], 3),
        "health_end": round(health_values[-1], 3),
        "health_change": round(health_values[-1] - health_values[0], 3),
        "avg_anomaly": round(sum(anomaly_values) / len(anomaly_values), 3),
        "max_anomaly": round(max(anomaly_values), 3),
        "anomaly_spikes": sum(1 for a in anomaly_values if a > 0.5),
        "duration_points": len(data)
    }
    return summary

def call_llm_api(prompt: str) -> str:
    """Call LLM API for interpretation using OpenRouter with free models"""
    try:
        import requests
        
        openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
        
        if not openrouter_api_key:
            print("OPENROUTER_API_KEY not found, using rule-based interpretation")
            return generate_rule_based_interpretation(prompt)
        
        # List of free models to try in order of preference
        free_models = [
    "mistralai/mistral-7b-instruct",
    "mistralai/mixtral-8x7b-instruct",

    # LLaMA-based strong general models
    "meta-llama/llama-3-8b-instruct",
    "meta-llama/llama-2-13b-chat",

    # Good for longer reasoning / explanations
    "huggingfaceh4/zephyr-7b-beta",
    "togethercomputer/redpajama-incite-chat-3b",

    # Code + reasoning friendly
    "deepseek-ai/deepseek-coder-6.7b-instruct",
    "codellama/codellama-7b-instruct",

    # Lightweight / fast (lower cost, quick replies)
    "google/gemma-7b-it",
    "tiiuae/falcon-7b-instruct",   # Compact alternative
        ]
        
        # Try each model until one succeeds
        for model in free_models:
            try:
                print(f"Attempting to use model: {model}")
                response = requests.post(
                    url="https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {openrouter_api_key}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "http://localhost:3000",  # Optional: your app URL
                        "X-Title": "Predictive Maintenance System"  # Optional: your app name
                    },
                    json={
                        "model": model,
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are an industrial predictive maintenance expert. Provide concise, actionable insights in 2-3 sentences."
                            },
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "temperature": 0.7,
                        "max_tokens": 200
                    },
                    timeout=15  # 15 second timeout
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result["choices"][0]["message"]["content"]
                    if content and len(content.strip()) > 10:  # Validate response
                        print(f"✅ Successfully used model: {model}")
                        return content
                else:
                    print(f"❌ Model {model} returned status {response.status_code}")
                    continue
                    
            except Exception as model_error:
                print(f"❌ Error with model {model}: {model_error}")
                continue
        
        # If all models fail, use rule-based fallback
        print("All AI models failed, using rule-based interpretation")
        return generate_rule_based_interpretation(prompt)
        
    except Exception as e:
        print(f"LLM API error: {e}")
        return generate_rule_based_interpretation(prompt)

def generate_rule_based_interpretation(prompt: str) -> str:
    """Fallback rule-based interpretation when LLM is unavailable"""
    # Extract values from prompt (simple parsing)
    lines = prompt.split('\n')
    health_change = 0
    avg_anomaly = 0
    anomaly_spikes = 0
    
    for line in lines:
        if "Health change:" in line:
            try:
                health_change = float(line.split(':')[1].strip())
            except:
                pass
        elif "Average anomaly score:" in line:
            try:
                avg_anomaly = float(line.split(':')[1].strip())
            except:
                pass
        elif "Number of anomaly spikes:" in line:
            try:
                anomaly_spikes = int(line.split(':')[1].strip())
            except:
                pass
    
    # Generate interpretation based on rules
    if health_change < -10:
        status = "The equipment health is degrading significantly"
        cause = "This indicates progressive wear or developing mechanical issues"
        action = "Schedule immediate inspection and consider preventive maintenance"
    elif health_change < -5:
        status = "The equipment shows moderate health decline"
        cause = "Normal operational wear is occurring at an elevated rate"
        action = "Monitor closely and plan maintenance within the next week"
    elif health_change > 5:
        status = "The equipment health is improving"
        cause = "Recent maintenance or operational adjustments are having positive effects"
        action = "Continue current maintenance schedule and document best practices"
    else:
        status = "The equipment health is stable"
        cause = "Normal operational fluctuations within acceptable parameters"
        action = "Maintain regular monitoring schedule"
    
    if anomaly_spikes > 10:
        status += " with frequent anomalies detected"
        action = "Prioritize immediate investigation of anomaly root causes. " + action
    elif anomaly_spikes > 5:
        status += " with some anomaly events"
        action = "Review anomaly patterns during next scheduled maintenance. " + action
    
    return f"{status}. {cause}. {action}"

@router.post("/interpret")
def interpret_trend(payload: dict):
    """Generate AI-powered interpretation of trend data"""
    summary = payload.get("summary", {})
    machine_id = payload.get("machine_id", "Unknown")

    prompt = f"""
You are an industrial predictive maintenance expert.

Analyzing machine: {machine_id}

Given this trend summary:
- Health started at {summary.get('health_start', 0)}
- Health ended at {summary.get('health_end', 0)}
- Health change: {summary.get('health_change', 0)}
- Average anomaly score: {summary.get('avg_anomaly', 0)}
- Maximum anomaly score: {summary.get('max_anomaly', 0)}
- Number of anomaly spikes: {summary.get('anomaly_spikes', 0)}

Explain in 2–3 sentences:
1. What is happening
2. Why it is happening
3. What action should be taken
"""

    insight = call_llm_api(prompt)
    
    return {
        "insight": insight,
        "machine_id": machine_id,
        "summary": summary
    }
