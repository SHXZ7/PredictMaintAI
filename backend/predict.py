from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import predictions_collection, alerts_collection
from datetime import datetime
import pickle
import pandas as pd
import os
import requests
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Load model once at startup
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
model = None

def load_model():
    """Load the trained model at startup"""
    global model
    try:
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)
        print("✅ Prediction model loaded successfully")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        model = None

# Load model on import
load_model()

class PredictionRequest(BaseModel):
    air_temp: float
    process_temp: float
    rpm: float
    torque: float
    tool_wear: float
    machine_id: str = "UNKNOWN"  # Optional machine identifier

class PredictionResponse(BaseModel):
    failure_probability: float
    health_score: float
    status: str
    time_to_failure_hours: int
    confidence: int
    prediction_id: str = None
    ai_recommendations: list = []

def call_llm_api(prompt: str) -> str:
    """Call LLM API using OpenRouter with free models (same pattern as history.py)"""
    try:
        openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
        
        if not openrouter_api_key:
            print("OPENROUTER_API_KEY not found, using rule-based recommendations")
            return None
        
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
    "tiiuae/falcon-7b-instruct",
        ]
        
        # Try each model until one succeeds
        for model_name in free_models:
            try:
                print(f"Attempting to use model: {model_name}")
                response = requests.post(
                    url="https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {openrouter_api_key}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "Predictive Maintenance System"
                    },
                    json={
                        "model": model_name,
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are an expert industrial maintenance advisor. Provide concise, actionable recommendations."
                            },
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "temperature": 0.7,
                        "max_tokens": 300
                    },
                    timeout=15
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result["choices"][0]["message"]["content"]
                    if content and len(content.strip()) > 10:
                        print(f"✅ Successfully used model: {model_name}")
                        return content
                else:
                    print(f"❌ Model {model_name} returned status {response.status_code}")
                    continue
                    
            except Exception as model_error:
                print(f"❌ Error with model {model_name}: {model_error}")
                continue
        
        # If all models fail, return None
        print("All AI models failed")
        return None
        
    except Exception as e:
        print(f"LLM API error: {e}")
        return None

def generate_ai_recommendations(prediction_data: dict, inputs: dict):
    """Generate AI-powered maintenance recommendations"""
    prompt = f"""You are an expert industrial maintenance advisor for predictive maintenance systems.

A machine has been analyzed with the following results:
- Failure Probability: {prediction_data['failure_probability']*100:.1f}%
- Health Score: {prediction_data['health_score']*100:.1f}%
- Time to Failure: ~{prediction_data['time_to_failure_hours']} hours
- Status: {prediction_data['status']}

Current sensor readings:
- Air Temperature: {inputs['air_temp']}K (normal: 295-305K)
- Process Temperature: {inputs['process_temp']}K (normal: 305-315K)
- Rotational Speed: {inputs['rpm']} RPM (normal: 1200-1800 RPM)
- Torque: {inputs['torque']} Nm (normal: 30-60 Nm)
- Tool Wear: {inputs['tool_wear']} minutes (max: 250 min)

Provide exactly 4 specific, actionable maintenance recommendations.
Focus on:
1. Immediate operational adjustments
2. Inspection priorities
3. Preventive maintenance actions
4. Safety considerations

Respond with 4 clear sentences, each on a new line. Do not use bullet points, dashes, or asterisks."""

    ai_response = call_llm_api(prompt)
    
    if ai_response:
        # Clean and parse recommendations
        recommendations = []
        lines = ai_response.strip().split('\n')
        
        for line in lines:
            # Remove common bullet point markers and numbering
            cleaned = line.strip()
            cleaned = cleaned.lstrip('-•*123456789. ')
            
            # Skip empty lines and very short lines
            if len(cleaned) > 20:
                # Ensure proper sentence structure
                if not cleaned.endswith('.'):
                    cleaned += '.'
                recommendations.append(cleaned)
        
        if len(recommendations) >= 4:
            print(f"✅ AI recommendations generated: {len(recommendations[:4])} items")
            return recommendations[:4]
        elif len(recommendations) > 0:
            # If we got some recommendations but not 4, supplement with rule-based
            print(f"⚠️ Only {len(recommendations)} AI recommendations, supplementing with rules")
            rule_based = generate_rule_based_recommendations(prediction_data, inputs)
            return (recommendations + rule_based)[:4]
    
    # Fallback to rule-based
    print("Using rule-based recommendations")
    return generate_rule_based_recommendations(prediction_data, inputs)

def generate_rule_based_recommendations(prediction_data: dict, inputs: dict):
    """Fallback rule-based recommendations when AI is unavailable"""
    recommendations = []
    
    status = prediction_data['status']
    
    # Check sensor conditions
    high_temp = inputs['air_temp'] > 302 or inputs['process_temp'] > 312
    high_rpm = inputs['rpm'] > 1700
    high_torque = inputs['torque'] > 55
    high_wear = inputs['tool_wear'] > 200
    
    if status == "FAILURE LIKELY":
        recommendations.append("Stop operations immediately and conduct emergency inspection of critical components to prevent catastrophic failure.")
        recommendations.append("Replace worn tools and components showing signs of excessive wear, particularly focusing on high-stress areas.")
        recommendations.append("Perform complete system diagnostics including bearing, motor, and cooling system checks before resuming operations.")
        recommendations.append("Document all findings and establish root cause analysis to prevent future occurrences.")
    
    elif status == "AT RISK":
        recommendations.append("Schedule maintenance inspection within 24 to 48 hours to prevent further degradation of machine health.")
        
        if high_wear:
            recommendations.append("Replace or sharpen cutting tools immediately as tool wear has exceeded the safe operational threshold.")
        elif high_torque:
            recommendations.append("Reduce load and torque by 15 to 20 percent to decrease mechanical stress on critical components.")
        else:
            recommendations.append("Inspect mechanical components for signs of wear, misalignment, or unusual vibration patterns.")
        
        if high_temp:
            recommendations.append("Check cooling system efficiency and increase coolant flow rate to bring temperatures back to normal range.")
        elif high_rpm:
            recommendations.append("Reduce rotational speed by 10 percent to minimize vibration and wear on moving parts.")
        else:
            recommendations.append("Increase lubrication frequency for all moving parts and verify lubrication system performance.")
    
    else:  # HEALTHY
        recommendations.append("Continue regular monitoring schedule as the machine is operating within normal parameters.")
        recommendations.append("Maintain current lubrication and cooling system settings to preserve optimal operating conditions.")
        recommendations.append("Document current operational baseline for future comparisons and trend analysis.")
        recommendations.append("Schedule next routine inspection according to standard maintenance calendar without urgent action needed.")
    
    return recommendations[:4]

def trigger_alert_from_prediction(prediction_data: dict, machine_id: str, prediction_id: str):
    """
    Automatically generate alert if prediction indicates high failure risk
    Creates closed-loop system: Prediction → Alert → Acknowledgement → Resolution
    """
    failure_prob = prediction_data['failure_probability']
    time_to_failure = prediction_data['time_to_failure_hours']
    
    # Trigger alert only for high-risk predictions
    if failure_prob > 0.6 or prediction_data['status'] == "FAILURE LIKELY":
        # Determine severity based on time to failure
        if time_to_failure <= 12:
            severity = "CRITICAL"
        elif time_to_failure <= 24:
            severity = "CRITICAL"
        else:
            severity = "WARNING"
        
        # Check for existing unacknowledged alerts to avoid duplicates
        existing_alert = alerts_collection.find_one({
            "machine_id": machine_id,
            "severity": severity,
            "acknowledged": False,
            "created_at": {"$gte": datetime.utcnow() - pd.Timedelta(minutes=30)}
        })
        
        if not existing_alert:
            # Create alert linked to prediction
            alert = {
                "machine_id": machine_id,
                "severity": severity,
                "message": f"Failure predicted within {time_to_failure} hours (probability: {failure_prob*100:.1f}%)",
                "predicted_hours": time_to_failure,
                "confidence": prediction_data['confidence'],
                "created_at": datetime.utcnow(),
                "acknowledged": False,
                "prediction_id": prediction_id,  # Link to prediction
                "source": "automated_prediction",
                "failure_probability": failure_prob
            }
            
            result = alerts_collection.insert_one(alert)
            print(f"🚨 AUTO-ALERT GENERATED: {severity} for {machine_id} (linked to prediction {prediction_id})")
            
            return {
                "alert_generated": True,
                "alert_id": str(result.inserted_id),
                "severity": severity
            }
    
    return {
        "alert_generated": False,
        "reason": "Failure probability below alert threshold"
    }

@router.post("/predict", response_model=PredictionResponse)
def predict_failure(request: PredictionRequest):
    """Predict machine failure probability with AI-powered recommendations and automatic alert generation"""
    if model is None:
        raise HTTPException(status_code=503, detail="Prediction model not available")
    
    try:
        # Prepare input dataframe
        X = pd.DataFrame([{
            "Air temperature [K]": request.air_temp,
            "Process temperature [K]": request.process_temp,
            "Rotational speed [rpm]": request.rpm,
            "Torque [Nm]": request.torque,
            "Tool wear [min]": request.tool_wear
        }])
        
        # Get prediction
        pred = model.predict(X)[0]
        prob = model.predict_proba(X)[0][1]
        
        # Determine status
        if prob < 0.2:
            status = "HEALTHY"
            time_to_failure = 48
        elif prob < 0.3:
            status = "HEALTHY"
            time_to_failure = 42
        elif prob < 0.4:
            status = "AT RISK"
            time_to_failure = 36
        elif prob < 0.5:
            status = "AT RISK"
            time_to_failure = 30
        elif prob < 0.6:
            status = "FAILURE LIKELY"
            time_to_failure = 24
        elif prob < 0.7:
            status = "FAILURE LIKELY"
            time_to_failure = 18
        elif prob < 0.8:
            status = "FAILURE LIKELY"
            time_to_failure = 12
        else:
            status = "FAILURE LIKELY"
            time_to_failure = 6
        
        confidence = min(95, int(prob * 100))
        health_score = 1 - prob
        
        prediction_data = {
            "failure_probability": round(prob, 3),
            "health_score": round(health_score, 3),
            "status": status,
            "time_to_failure_hours": time_to_failure,
            "confidence": confidence
        }
        
        # Generate AI-powered recommendations
        ai_recommendations = generate_ai_recommendations(
            prediction_data,
            {
                "air_temp": request.air_temp,
                "process_temp": request.process_temp,
                "rpm": request.rpm,
                "torque": request.torque,
                "tool_wear": request.tool_wear
            }
        )
        
        # Save prediction to MongoDB with AI recommendations
        prediction_record = {
            "machine_id": request.machine_id,
            "inputs": {
                "air_temp": request.air_temp,
                "process_temp": request.process_temp,
                "rpm": request.rpm,
                "torque": request.torque,
                "tool_wear": request.tool_wear
            },
            **prediction_data,
            "ai_recommendations": ai_recommendations,
            "timestamp": datetime.utcnow(),
            "alert_generated": False  # Will be updated if alert is created
        }
        
        result = predictions_collection.insert_one(prediction_record)
        prediction_id = str(result.inserted_id)
        
        print(f"✅ Prediction saved: {prediction_id}")
        
        # 🔄 CLOSED-LOOP: Trigger automatic alert generation for high-risk predictions
        alert_result = trigger_alert_from_prediction(prediction_data, request.machine_id, prediction_id)
        
        if alert_result['alert_generated']:
            # Update prediction record to mark that alert was generated
            predictions_collection.update_one(
                {"_id": result.inserted_id},
                {"$set": {
                    "alert_generated": True,
                    "alert_id": alert_result['alert_id']
                }}
            )
            print(f"✅ Prediction {prediction_id} linked to alert {alert_result['alert_id']}")
        
        return PredictionResponse(
            **prediction_data,
            prediction_id=prediction_id,
            ai_recommendations=ai_recommendations
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.get("/predict/health")
def get_model_health():
    """Check if prediction model is loaded and ready"""
    if model is None:
        return {
            "status": "error",
            "message": "Model not loaded",
            "model_path": MODEL_PATH
        }
    return {
        "status": "ready",
        "message": "Prediction model loaded and ready",
        "model_type": str(type(model))
    }

@router.get("/predictions/history")
def get_prediction_history(machine_id: str = None, limit: int = 100):
    """
    Get prediction history for trend analysis
    Optionally filter by machine_id
    """
    query = {}
    if machine_id:
        query["machine_id"] = machine_id
    
    cursor = predictions_collection.find(
        query,
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit)
    
    predictions = list(cursor)
    
    # Convert timestamps to strings
    for pred in predictions:
        pred["timestamp"] = str(pred["timestamp"])
    
    return {
        "count": len(predictions),
        "predictions": predictions
    }

@router.get("/predictions/stats")
def get_prediction_stats(machine_id: str = None):
    """
    Get prediction statistics and trends
    """
    query = {}
    if machine_id:
        query["machine_id"] = machine_id
    
    total = predictions_collection.count_documents(query)
    
    if total == 0:
        return {
            "total_predictions": 0,
            "message": "No predictions found"
        }
    
    # Get status distribution
    pipeline = [
        {"$match": query},
        {"$group": {
            "_id": "$status",
            "count": {"$sum": 1},
            "avg_confidence": {"$avg": "$confidence"}
        }}
    ]
    
    status_dist = list(predictions_collection.aggregate(pipeline))
    
    # Get recent trend (last 10 predictions)
    recent = list(predictions_collection.find(
        query
    ).sort("timestamp", -1).limit(10))
    
    avg_health = sum(p.get("health_score", 0) for p in recent) / len(recent) if recent else 0
    avg_prob = sum(p.get("failure_probability", 0) for p in recent) / len(recent) if recent else 0
    
    return {
        "total_predictions": total,
        "status_distribution": status_dist,
        "recent_trend": {
            "avg_health_score": round(avg_health, 3),
            "avg_failure_probability": round(avg_prob, 3),
            "sample_size": len(recent)
        }
    }
