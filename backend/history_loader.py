import pickle
import os
import random

HISTORY_PATH = os.path.join(os.path.dirname(__file__), "history.pkl")

def load_history():
    with open(HISTORY_PATH, "rb") as f:
        data = pickle.load(f)

    # Machine IDs for assignment
    machines = ["Machine_A", "Machine_B", "Machine_C", "Machine_D", "Machine_E"]

    # Ensure timestamps are strings (JSON safe)
    for row in data:
        if "timestamp" in row:
            row["timestamp"] = str(row["timestamp"])
        
        # Ensure health is a number (not string with %)
        if "health" in row:
            health_val = row["health"]
            if isinstance(health_val, str):
                health_val = health_val.replace("%", "")
            row["health"] = float(health_val)
        
        # Ensure anomaly_score is a float
        if "anomaly_score" in row:
            row["anomaly_score"] = float(row["anomaly_score"])
        
        # Assign machine_id if not present (for historical data)
        if "machine_id" not in row:
            row["machine_id"] = random.choice(machines)

    return data
