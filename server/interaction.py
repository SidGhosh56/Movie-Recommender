from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime
client = MongoClient('mongodb://localhost:27017/')
db = client['CineVortex']  # Replace with your DB name
user_interactions = db['interactions']

app = Flask(__name__)

@app.route('/api/log_interaction', methods=['POST'])
def log_interaction():
    data = request.json

    try:
        interaction = {
            "userId": ObjectId(data["userId"]),
            "action": data["action"],
            "timestamp": datetime.utcnow()
        }

        if data.get("movieId"):
            interaction["movieId"] = ObjectId(data["movieId"])
        if data.get("searchQuery"):
            interaction["searchQuery"] = data["searchQuery"]
        if "rating" in data:
            interaction["rating"] = float(data["rating"])

        db.user_interactions.insert_one(interaction)
        return jsonify({"status": "success", "message": "Interaction logged!"})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})