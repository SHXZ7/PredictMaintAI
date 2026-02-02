from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from rag_context import build_machine_context, build_fleet_context, format_context_for_ai
import os
import requests
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    machine_id: str = None  # Optional: for machine-specific questions

class ChatResponse(BaseModel):
    response: str
    context_used: str = None
    model_used: str = None

def explain_machine_health(machine_context: dict, user_question: str) -> tuple:
    """
    RAG-based AI explanation service
    Returns: (ai_response, model_used)
    """
    try:
        openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
        
        if not openrouter_api_key:
            return generate_rule_based_answer(machine_context, user_question), "rule-based"
        
        # Format context for AI (Retrieval step)
        formatted_context = format_context_for_ai(machine_context)
        
        # Build expert prompt (Generation step)
        system_prompt = """You are an expert predictive maintenance engineer with 20+ years of experience in industrial equipment reliability.

Your role is to:
- Analyze machine health data and sensor readings
- Provide clear, actionable recommendations
- Explain technical issues in understandable terms
- Prioritize safety and operational efficiency
- Base all answers strictly on the provided system state data

RULES:
- Only use information from the system state provided
- Do not speculate or make assumptions
- If data is insufficient, clearly state that
- Provide specific, actionable advice
- Use technical terminology but explain it clearly"""

        user_prompt = f"""SYSTEM STATE:
{formatted_context}

USER QUESTION:
{user_question}

Provide a clear, expert response based only on the current system state. Be concise but thorough."""

        # Try multiple free models with fallback
        free_models = [
            "arcee-ai/trinity-large-preview:free",
            "meta-llama/llama-3-8b-instruct",
            "mistralai/mistral-7b-instruct",
            "google/gemma-7b-it",
            "mistralai/mixtral-8x7b-instruct",
                "deepseek/deepseek-r1t2-chimera:free",
    "z-ai/glm-4.5-air:free",
    "arcee-ai/trinity-large-preview:free",
    "deepseek/deepseek-r1t-chimera:free"
        ]
        
        for model_name in free_models:
            try:
                print(f"Attempting AI chat with model: {model_name}")
                
                response = requests.post(
                    url="https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {openrouter_api_key}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "Predictive Maintenance AI Chat"
                    },
                    json={
                        "model": model_name,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 500
                    },
                    timeout=20
                )
                
                if response.status_code == 200:
                    result = response.json()
                    ai_response = result["choices"][0]["message"]["content"].strip()
                    
                    if len(ai_response) > 30:  # Validate meaningful response
                        print(f"✅ Successfully used model: {model_name}")
                        return ai_response, model_name
                else:
                    print(f"❌ Model {model_name} returned status {response.status_code}")
                    continue
                    
            except Exception as model_error:
                print(f"❌ Error with model {model_name}: {model_error}")
                continue
        
        # Fallback if all models fail
        print("All AI models failed, using rule-based responses")
        return generate_rule_based_answer(machine_context, user_question), "rule-based"
        
    except Exception as e:
        print(f"AI explanation service error: {e}")
        return generate_rule_based_answer(machine_context, user_question), "rule-based"

def generate_rule_based_answer(context: dict, question: str) -> str:
    """
    Fallback rule-based answers when AI is unavailable
    """
    question_lower = question.lower()
    
    # Machine-specific context
    if "machine_id" in context:
        machine_id = context.get("machine_id")
        health = context.get("health_score")
        status = context.get("status")
        alerts = context.get("active_alerts_count", 0)
        trend = context.get("trend_direction", "unknown")
        
        # Status questions
        if any(word in question_lower for word in ["status", "how is", "condition", "doing"]):
            response = f"{machine_id} is currently {status} with {health}% health. "
            response += f"The health trend is {trend}. "
            if alerts > 0:
                response += f"There are {alerts} active alerts requiring attention. "
            if status == "CRITICAL":
                response += "Immediate maintenance action is required to prevent failure."
            elif status == "WARNING":
                response += "Schedule maintenance within 24-48 hours."
            else:
                response += "Continue regular monitoring."
            return response
        
        # Health questions
        elif any(word in question_lower for word in ["health", "score"]):
            response = f"{machine_id} has a health score of {health}%. "
            if health < 40:
                response += "This is critically low and indicates imminent failure risk. "
            elif health < 60:
                response += "This is below optimal levels and requires attention. "
            else:
                response += "This is within acceptable operating range. "
            return response
        
        # Alert questions
        elif any(word in question_lower for word in ["alert", "warning", "notification"]):
            if alerts == 0:
                return f"{machine_id} has no active alerts at this time."
            else:
                response = f"{machine_id} has {alerts} active alert(s). "
                if context.get("alerts"):
                    alert = context["alerts"][0]
                    response += f"Most critical: {alert['severity']} - {alert['message']}"
                return response
        
        # Recommendation questions
        elif any(word in question_lower for word in ["recommend", "action", "should", "what to do"]):
            if status == "CRITICAL":
                return f"For {machine_id}: Stop operations immediately and conduct emergency inspection. Replace worn components and perform complete diagnostics before resuming."
            elif status == "WARNING":
                return f"For {machine_id}: Schedule maintenance inspection within 24-48 hours. Monitor closely and reduce operational load if possible."
            else:
                return f"For {machine_id}: Continue regular monitoring schedule. Maintain current maintenance intervals and document operational baseline."
        
        # Prediction questions
        elif any(word in question_lower for word in ["predict", "fail", "failure", "when"]):
            pred = context.get("prediction")
            if pred:
                prob = pred.get("failure_probability", 0) * 100
                hours = pred.get("time_to_failure_hours", 0)
                return f"{machine_id} has a {prob:.1f}% failure probability with an estimated {hours} hours to failure. Confidence level: {pred.get('confidence', 0)}%."
            else:
                return f"No recent failure prediction available for {machine_id}."
    
    # Fleet-wide context
    else:
        fleet = context.get("fleet_overview", {})
        
        if any(word in question_lower for word in ["fleet", "overall", "total", "summary"]):
            return f"Fleet health is at {fleet.get('fleet_health', 0)}%. Out of {fleet.get('total_machines', 0)} machines: {fleet.get('critical_machines', 0)} critical, {fleet.get('warning_machines', 0)} warning, {fleet.get('healthy_machines', 0)} healthy. Total active alerts: {fleet.get('total_alerts', 0)}."
        
        elif any(word in question_lower for word in ["critical", "worst", "problem"]):
            critical = context.get("critical_machines", [])
            if critical:
                machines_list = ", ".join([m["machine_id"] for m in critical[:3]])
                return f"Critical machines requiring immediate attention: {machines_list}. These have the lowest health scores and highest alert counts."
            else:
                return "No machines are currently in critical status."
    
    # Generic fallback
    return "I can help you with machine status, health scores, alerts, predictions, and maintenance recommendations. Please ask a specific question about a machine or the fleet."

@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    """
    AI Chat endpoint for maintenance engineer queries
    Uses RAG (Retrieval-Augmented Generation) to provide contextual answers
    """
    try:
        # Validate message
        if not request.message or not request.message.strip():
            raise HTTPException(status_code=422, detail="Message cannot be empty")
        
        # Build context (Retrieval step)
        if request.machine_id:
            # Validate machine exists
            context = build_machine_context(request.machine_id)
            if not context:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Machine {request.machine_id} not found or insufficient data"
                )
        else:
            # Fleet-wide context
            context = build_fleet_context()
            if not context or context.get('fleet_overview', {}).get('total_machines', 0) == 0:
                raise HTTPException(
                    status_code=404,
                    detail="No machine data available in the fleet"
                )
        
        # Generate AI response (Generation step)
        ai_response, model_used = explain_machine_health(context, request.message)
        
        # Format context summary for response
        if request.machine_id:
            context_summary = f"Machine: {context['machine_id']}, Health: {context['health_score']}%, Status: {context['status']}"
        else:
            fleet = context.get("fleet_overview", {})
            context_summary = f"Fleet: {fleet.get('total_machines', 0)} machines, {fleet.get('fleet_health', 0)}% health"
        
        return ChatResponse(
            response=ai_response,
            context_used=context_summary,
            model_used=model_used
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Chat service error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat service error: {str(e)}")

@router.get("/chat/test")
def test_chat():
    """Test endpoint to verify chat service is working"""
    return {
        "status": "online",
        "service": "AI Maintenance Engineer Chat",
        "features": [
            "Machine-specific queries",
            "Fleet-wide analysis",
            "Health explanations",
            "Alert summaries",
            "Failure predictions",
            "Maintenance recommendations"
        ]
    }
