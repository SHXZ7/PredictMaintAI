import requests
import time
import random
from datetime import datetime
from constants import MACHINES

def simulate_sensor_data():
    """Generate and send simulated REALISTIC sensor data - EVEN DISTRIBUTION"""
    print("🔄 Starting INDUSTRY-GRADE sensor data simulator...")
    print(f"📊 Distributing data across {len(MACHINES)} machines")
    
    machine_index = 0  # Track which machine to send to
    
    while True:
        # **EVEN DISTRIBUTION**: Cycle through machines instead of random
        machine_id = MACHINES[machine_index]
        machine_index = (machine_index + 1) % len(MACHINES)
        
        # REALISTIC health distribution
        rand = random.random()
        if rand < 0.60:
            health = random.uniform(70, 95)
            anomaly = random.uniform(0.05, 0.25)
        elif rand < 0.90:
            health = random.uniform(55, 70)
            anomaly = random.uniform(0.20, 0.45)
        else:
            health = random.uniform(30, 55)
            anomaly = random.uniform(0.40, 0.75)
        
        # Determine status
        if health < 35 or anomaly > 0.65:
            status = "CRITICAL"
        elif health < 55 or anomaly > 0.40:
            status = "WARNING"
        else:
            status = "NORMAL"
        
        # Send to backend with specific machine_id
        try:
            response = requests.post(
                "http://localhost:8000/api/sensor",
                json={
                    "health": health,
                    "anomaly": anomaly,
                    "status": status,
                    "machine_id": machine_id  # Send specific machine
                }
            )
            
            timestamp = datetime.now().strftime("%H:%M:%S")
            print(f"[{timestamp}] ✅ {machine_id:15s} Health={health:.1f}%, Anomaly={anomaly:.3f}, Status={status}")
            
        except Exception as e:
            print(f"❌ Error sending data: {e}")
        
        time.sleep(2)  # Send every 2 seconds (faster distribution)

if __name__ == "__main__":
    simulate_sensor_data()
