import paho.mqtt.client as mqtt
import time
import os
import random
import pandas as pd

BROKER = "localhost"
PORT = 1883
TOPIC = "machine/vibration"

DATA_DIR = r"D:\HACK!\data\bearing_data"

TRAIN_COUNT = 200
STREAM_COUNT = 200
DELAY = 0.8

print("=== MQTT PUBLISHER STARTED ===")

client = mqtt.Client()
client.connect(BROKER, PORT)

# ---------------------------------
# SORT FILES BY TIME (EARLY → LATE)
# ---------------------------------
all_files = sorted(os.listdir(DATA_DIR))

# Use early-life data as healthy candidates
healthy_pool = all_files[:int(0.3 * len(all_files))]   # first 30%
degraded_pool = all_files[int(0.3 * len(all_files)):]

train_files = random.sample(healthy_pool, TRAIN_COUNT)
stream_files = random.sample(degraded_pool, STREAM_COUNT)

# ---------------------------------
# TRAINING PHASE
# ---------------------------------
print("\n--- TRAINING PHASE (HEALTHY) ---")

for f in train_files:
    path = os.path.join(DATA_DIR, f)
    signal = pd.read_csv(path, sep="\t", header=None).values.flatten()
    payload = ",".join(map(str, signal))

    client.publish(TOPIC, payload)
    print(f"TRAIN → {f}")
    time.sleep(DELAY)

print("\n--- TRAINING COMPLETE ---\n")
time.sleep(3)

# ---------------------------------
# STREAMING PHASE
# ---------------------------------
print("--- STREAMING PHASE (REALISTIC MIX) ---")

for f in stream_files:
    path = os.path.join(DATA_DIR, f)
    signal = pd.read_csv(path, sep="\t", header=None).values.flatten()
    payload = ",".join(map(str, signal))

    client.publish(TOPIC, payload)
    print(f"STREAM → {f}")
    time.sleep(DELAY)

print("\n=== STREAMING COMPLETE ===")
