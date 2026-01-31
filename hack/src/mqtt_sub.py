import sys
sys.path.append(r"D:\HACK!\src")

import paho.mqtt.client as mqtt
import numpy as np
from features import extract_features
from model import AnomalyModel
from health import HealthMonitor
from datetime import datetime
from collections import deque
import pickle

# ===============================
# CONFIG
# ===============================
HISTORY_FILE = "history.pkl"
HISTORY_SIZE = 500
TRAIN_SAMPLES = 200

# ===============================
# GLOBAL STATE
# ===============================
history = deque(maxlen=HISTORY_SIZE)
training_features = []
model_trained = False

model = AnomalyModel()
health_monitor = HealthMonitor()

print("=== SUBSCRIBER FILE STARTED ===")

# ===============================
# MQTT CALLBACKS
# ===============================
def on_connect(client, userdata, flags, rc):
    print("CONNECTED TO MQTT BROKER, rc =", rc)
    client.subscribe("machine/vibration")
    print("SUBSCRIBED TO machine/vibration")
    print("WAITING FOR DATA...\n")

def on_message(client, userdata, msg):
    global model_trained

    # Decode signal
    signal = np.array(
        list(map(float, msg.payload.decode().split(","))),
        dtype=np.float64
    )

    features = extract_features(signal)

    # ===============================
    # TRAINING PHASE
    # ===============================
    if not model_trained:
        training_features.append(features)
        print(f"Training sample {len(training_features)}/{TRAIN_SAMPLES}")

        if len(training_features) >= TRAIN_SAMPLES:
            X = np.array(training_features)
            model.fit(X)
            model_trained = True
            print("\n✅ MODEL TRAINED ON HEALTHY DATA\n")

        return  # ⛔ DO NOT SCORE BEFORE TRAINING

    # ===============================
    # INFERENCE PHASE
    # ===============================
    score = model.score(features)
    score = min(score, 10.0)  # extra safety

    health = health_monitor.update(score)

    if health < 0.3:
        status = "CRITICAL"
    elif health < 0.6:
        status = "WARNING"
    else:
        status = "OK"

    timestamp = datetime.now().strftime("%H:%M:%S")

    entry = {
        "timestamp": timestamp,
        "anomaly": float(score),
        "health": float(health),
        "status": status
    }

    # Save rolling history
    history.append(entry)
    with open(HISTORY_FILE, "wb") as f:
        pickle.dump(list(history), f)

    # Console output
    print(f"[{timestamp}] Anomaly={score:.3f} | Health={health:.3f}")

    if status == "WARNING":
        print("⚠️ WARNING: Bearing degradation detected")

    if status == "CRITICAL":
        print("🚨 CRITICAL: Bearing failure likely soon")

    print("-" * 50)

# ===============================
# MQTT CLIENT
# ===============================
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

print("CONNECTING TO MQTT BROKER...")
client.connect("localhost", 1883)

client.loop_forever()


