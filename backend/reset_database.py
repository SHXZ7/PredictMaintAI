from database import sensor_collection, alerts_collection, predictions_collection

print("🗑️  Clearing database...")

# Drop all collections
deleted_sensors = sensor_collection.delete_many({})
deleted_alerts = alerts_collection.delete_many({})
deleted_predictions = predictions_collection.delete_many({})

print(f"✅ Deleted {deleted_sensors.deleted_count} sensor records")
print(f"✅ Deleted {deleted_alerts.deleted_count} alerts")
print(f"✅ Deleted {deleted_predictions.deleted_count} predictions")

print("\n📊 Current database state:")
print(f"Sensors: {sensor_collection.count_documents({})} documents")
print(f"Alerts: {alerts_collection.count_documents({})} documents")
print(f"Predictions: {predictions_collection.count_documents({})} documents")

print("\n✅ Database cleared! Ready for fresh simulation.")
print("📝 Next steps:")
print("1. Start backend: python main.py")
print("2. Start simulator: python simulator.py")
