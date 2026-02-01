import requests
import time
import schedule
from database import sensor_collection, predictions_collection, alerts_collection
from alerts import analyze_machine_health, generate_alert
from constants import MACHINES
from datetime import datetime

def check_and_generate_alerts():
    """
    Check all machines and generate predictions + alerts
    This is the AUTOMATED WORKFLOW
    """
    print("\n" + "="*50)
    print(f"🔍 Checking machines at {datetime.now().strftime('%H:%M:%S')}")
    print("="*50)
    
    # Get all machines that have recent data
    machines_with_data = sensor_collection.distinct("machine_id")
    
    if not machines_with_data:
        print("⚠️  No machine data found in database")
        return
    
    alerts_generated = 0
    predictions_made = 0
    
    for machine_id in machines_with_data:
        try:
            # Step 1: Analyze sensor data and generate prediction
            prediction = analyze_machine_health(machine_id)
            
            if not prediction:
                print(f"  ⏭️  {machine_id}: Insufficient data")
                continue
            
            # Step 2: Save prediction to database
            prediction_doc = {
                **prediction,
                "timestamp": datetime.utcnow(),
                "source": "automated_scheduler"
            }
            
            result = predictions_collection.insert_one(prediction_doc)
            predictions_made += 1
            
            print(f"  ✅ {machine_id}: Health {prediction['current_health']:.1f}%, Confidence {prediction['confidence']:.0%}")
            
            # Step 3: Generate alert if needed
            alert = generate_alert(machine_id, prediction)
            
            if alert:
                alerts_generated += 1
                print(f"     🚨 Alert generated: {alert['severity']}")
            
        except Exception as e:
            print(f"  ❌ Error checking {machine_id}: {e}")
            continue
    
    print("\n✅ Alert check completed:")
    print(f"   Machines checked: {len(machines_with_data)}")
    print(f"   Predictions made: {predictions_made}")
    print(f"   Alerts generated: {alerts_generated}")
    print("="*50 + "\n")

def run_scheduler():
    """
    Run the scheduler continuously
    Checks every 5 minutes
    """
    print("🚀 Alert scheduler started")
    print("📊 Checking machines every 5 minutes...")
    print("-" * 50)
    
    # Run immediately on startup
    check_and_generate_alerts()
    
    # Schedule to run every 5 minutes
    schedule.every(5).minutes.do(check_and_generate_alerts)
    
    # Keep running
    while True:
        schedule.run_pending()
        time.sleep(30)  # Check every 30 seconds if it's time to run

if __name__ == "__main__":
    run_scheduler()
