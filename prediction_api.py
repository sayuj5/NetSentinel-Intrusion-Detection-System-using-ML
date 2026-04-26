from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np
import os
import logging
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - PREDICTOR - %(levelname)s - %(message)s')

class ModelManager:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
            cls._instance._load_models()
        return cls._instance

    def _load_models(self):
        try:
            base_path = os.path.dirname(__file__)
            self.model = joblib.load(os.path.join(base_path, 'ids_model.pkl'))
            self.scaler = joblib.load(os.path.join(base_path, 'scaler.pkl'))
            self.features_list = joblib.load(os.path.join(base_path, 'features_list.pkl'))
            self.encoders = joblib.load(os.path.join(base_path, 'encoders.pkl'))
            logging.info("AI Models and Encoders loaded successfully.")
        except Exception as e:
            logging.error(f"Critical Error: Failed to load models: {e}")
            self.model = None

    def predict(self, raw_data):
        if not self.model:
            return {"error": "Model not available"}, 500
        
        try:
            df = pd.DataFrame([raw_data])
            
            # 1. Encoding
            for col in ['protocol_type', 'service', 'flag']:
                if col in self.encoders:
                    le = self.encoders[col]
                    df[col] = df[col].apply(lambda x: le.transform([x])[0] if x in le.classes_ else -1)
            
            # 2. Scaling
            numeric_cols = [c for c in self.features_list if c not in ['protocol_type', 'service', 'flag']]
            # Ensure all columns exist in df, if not add them with 0
            for col in self.features_list:
                if col not in df.columns:
                    df[col] = 0
            
            final_df = df[self.features_list]
            final_df[numeric_cols] = self.scaler.transform(final_df[numeric_cols])
            
            # 3. Inference
            pred = self.model.predict(final_df)[0]
            proba = self.model.predict_proba(final_df)[0]
            
            return {
                "result": "Intrusion Detected!" if pred == 1 else "Normal Traffic",
                "is_intrusion": bool(pred),
                "confidence": round(proba[pred] * 100, 2),
                "attack_type": "Anomalous Traffic" if pred == 1 else "Normal"
            }
        except Exception as e:
            logging.error(f"Prediction logic error: {e}")
            return {"error": str(e)}, 500

manager = ModelManager()

@app.route("/predict", methods=["POST"])
def predict_route():
    data = request.json
    result = manager.predict(data)
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)