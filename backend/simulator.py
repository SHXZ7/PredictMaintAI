import requests
import time
import random
from datetime import datetime

def simulate_sensor_data():
    """Generate and send simulated sensor data every 2 seconds"""
    print("🔄 Starting sensor data simulator...")
    
    while True:
        # Generate realistic sensor values
        health = random.uniform(20, 95)  # 20-95%
        anomaly = random.uniform(0.1, 0.9)  # 0.1-0.9
        
        # Determine status based on health and anomaly
        if health < 40 or anomaly > 0.7:
            status = "CRITICAL"
        elif health < 60 or anomaly > 0.5:
            status = "WARNING"
        else:
            status = "NORMAL"
        
        # Send to backend
        try:
            response = requests.post(
                "http://localhost:8000/api/sensor",
                json={
                    "health": health,
                    "anomaly": anomaly,
                    "status": status
                }
            )
            
            timestamp = datetime.now().strftime("%H:%M:%S")
            print(f"[{timestamp}] ✅ Sent: Health={health:.1f}%, Anomaly={anomaly:.3f}, Status={status}")
            
        except Exception as e:
            print(f"❌ Error sending data: {e}")
        
        time.sleep(2)  # Send every 2 seconds

if __name__ == "__main__":
    simulate_sensor_data()
