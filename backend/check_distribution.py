from database import sensor_collection
from health import compute_fleet_health
from constants import MACHINES

print("📊 Checking current fleet health distribution...\n")

fleet = compute_fleet_health()

print("=" * 60)
print(f"Fleet Health: {fleet['fleet_health']}%")
print(f"Total Machines: {fleet['total_machines']}")
print("=" * 60)

print(f"\n🏥 Health Distribution:")
print(f"  ✅ Healthy:  {fleet['healthy_machines']:2d} ({fleet['healthy_machines']/fleet['total_machines']*100:.1f}%)")
print(f"  ⚠️  Warning:  {fleet['warning_machines']:2d} ({fleet['warning_machines']/fleet['total_machines']*100:.1f}%)")
print(f"  🔴 Critical: {fleet['critical_machines']:2d} ({fleet['critical_machines']/fleet['total_machines']*100:.1f}%)")

print(f"\n🚨 Alerts:")
print(f"  Active Alerts: {fleet['total_unacknowledged_alerts']}")
print(f"  Critical Alerts: {fleet['total_critical_alerts']}")

print(f"\n📈 Anomaly Rate: {fleet['avg_anomaly_rate']}%")

print("\n" + "=" * 60)
print("📋 Individual Machine Status:")
print("=" * 60)

for machine in fleet['machines']:
    status_icon = "✅" if machine['status'] == "HEALTHY" else "⚠️" if machine['status'] == "WARNING" else "🔴"
    print(f"{status_icon} {machine['machine_id']:18s} | Health: {machine['health_score']:5.1f}% | Status: {machine['status']}")

print("\n" + "=" * 60)

# Check if all 8 machines are present
unique_machines = sensor_collection.distinct("machine_id")
print(f"\n🔍 Machines in database: {len(unique_machines)}/{len(MACHINES)}")
for machine in MACHINES:
    count = sensor_collection.count_documents({"machine_id": machine})
    status = "✅" if count > 0 else "❌"
    print(f"{status} {machine}: {count} data points")

print("\n" + "=" * 60)

# Health check
if fleet['healthy_machines'] > fleet['total_machines'] * 0.5:
    print("✅ Distribution looks REALISTIC! Most machines healthy.")
else:
    print("⚠️  Many machines unhealthy - may need more simulation time or reset.")

print("=" * 60)

print("📊 Checking sensor data distribution...\n")
print("=" * 60)

for machine in MACHINES:
    count = sensor_collection.count_documents({"machine_id": machine})
    status = "✅" if count >= 10 else "⚠️" if count > 0 else "❌"
    print(f"{status} {machine:20s} {count:4d} data points")

print("=" * 60)

total = sensor_collection.count_documents({})
print(f"\nTotal sensor records: {total}")

# Get distribution
machines_in_db = sensor_collection.distinct("machine_id")
print(f"Machines with data: {len(machines_in_db)}/{len(MACHINES)}")

print("\n💡 Each machine needs at least 10 data points for predictions")
print("   Keep the simulator running to collect more data!")
