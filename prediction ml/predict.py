import pickle
import pandas as pd

with open("model.pkl", "rb") as f:
    model = pickle.load(f)

print("\nEnter values (use realistic ranges!)")

air_temp = float(input("Air temperature [K] (295–305): "))
process_temp = float(input("Process temperature [K] (305–315): "))
rpm = float(input("Rotational speed [rpm] (1200–1800): "))
torque = float(input("Torque [Nm] (30–60): "))
tool_wear = float(input("Tool wear [min] (0–250): "))

X = pd.DataFrame([{
    "Air temperature [K]": air_temp,
    "Process temperature [K]": process_temp,
    "Rotational speed [rpm]": rpm,
    "Torque [Nm]": torque,
    "Tool wear [min]": tool_wear
}])

pred = model.predict(X)[0]
prob = model.predict_proba(X)[0][1]

if prob < 0.2:
    status = "HEALTHY"
elif prob < 0.5:
    status = "AT RISK"
else:
    status = "FAILURE LIKELY"

print("\n--- RESULT ---")
print("Status:", status)
print(f"Failure probability: {prob*100:.2f}%")
print(f"Health score: {(1-prob)*100:.2f}%")
