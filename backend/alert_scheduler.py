import requests
import time
import schedule

def check_and_generate_alerts():
    """Periodically check all machines and generate alerts"""
    try:
        response = requests.post("http://localhost:8000/api/alerts/check")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Alert check completed:")
            print(f"   Machines checked: {data.get('machines_checked', 0)}")
            print(f"   Alerts generated: {data.get('alerts_generated', 0)}")
        else:
            print(f"❌ Alert check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error checking alerts: {e}")

def run_scheduler():
    """Run the alert scheduler"""
    print("🚀 Alert scheduler started")
    print("📊 Checking machines every 5 minutes...")
    
    # Check immediately on startup
    check_and_generate_alerts()
    
    # Schedule checks every 5 minutes
    schedule.every(5).minutes.do(check_and_generate_alerts)
    
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == "__main__":
    run_scheduler()
