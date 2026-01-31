import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load env variables
load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")

print("DEBUG MONGO_URL =", MONGO_URL)

if not MONGO_URL:
    raise RuntimeError("❌ MONGO_URL not found in .env")

client = MongoClient(MONGO_URL)
db = client["jain_uni"]
users_collection = db["users"]
sensor_collection = db["sensor_data"]
alerts_collection = db["alerts"]
predictions_collection = db["predictions"]

print("✅ MongoDB Atlas client initialized")
