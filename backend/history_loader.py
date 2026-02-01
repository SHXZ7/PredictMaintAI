import pickle
import os
import random
from constants import MACHINES

HISTORY_PATH = os.path.join(os.path.dirname(__file__), "history.pkl")

def load_history():
    with open(HISTORY_PATH, "rb") as f:
        data = pickle.load(f)

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
        
        # Assign machine_id from MACHINES constant (not Machine_A to Machine_E)
        if "machine_id" not in row:
            row["machine_id"] = random.choice(MACHINES)
        # Replace old names with new ones
        elif row["machine_id"].startswith("Machine_"):
            row["machine_id"] = random.choice(MACHINES)

    return data
