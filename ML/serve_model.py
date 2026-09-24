"""
Mind Mate - Machine Learning Inference Microservice
Loads personalization_random_forest_v2.joblib and provides a zero-overhead REST API
for the Mind Mate web platform.

Endpoints:
  GET  /health  - Checks model status and metadata
  POST /predict - Accepts 12 telemetry features and returns class prediction & probabilities
"""

import sys
import os
import json
from http.server import HTTPServer, BaseHTTPRequestHandler

# Add current directory to path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_FILE = os.path.join(BASE_DIR, "personalization_random_forest_v2.joblib")

loaded_package = None

def load_model():
    global loaded_package
    if loaded_package is None:
        try:
            import joblib
            print(f"[ML Server] Loading model from {MODEL_FILE}...")
            loaded_package = joblib.load(MODEL_FILE)
            print("[ML Server] Model loaded successfully.")
        except Exception as e:
            print(f"[ML Server ERROR] Could not load model: {e}")
            loaded_package = None
    return loaded_package

class MLRequestHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path in ["/", "/health"]:
            pkg = load_model()
            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            status_data = {
                "status": "healthy" if pkg is not None else "model_not_loaded",
                "model_name": "Personalization Random Forest V2",
                "features": pkg["feature_names"] if pkg else [],
                "recommendations": pkg["recommendations"] if pkg else {}
            }
            self.wfile.write(json.dumps(status_data).encode("utf-8"))
        else:
            self.send_response(404)
            self._send_cors_headers()
            self.end_headers()

    def do_POST(self):
        if self.path == "/predict":
            content_length = int(self.headers.get("Content-Length", 0))
            body_bytes = self.rfile.read(content_length)
            try:
                data = json.loads(body_bytes.decode("utf-8"))
            except Exception as e:
                self.send_response(400)
                self._send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": f"Invalid JSON: {e}"}).encode("utf-8"))
                return

            pkg = load_model()
            if pkg is None:
                self.send_response(503)
                self._send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Model package not loaded."}).encode("utf-8"))
                return

            model = pkg["model"]
            feature_names = pkg["feature_names"]
            recommendations = pkg["recommendations"]

            try:
                import pandas as pd
                # Form row matching exact feature names
                row = {feat: float(data.get(feat, 0.0)) for feat in feature_names}
                # Specific integer casts
                for int_feat in ["attempts", "hint_usage", "difficulty", "game_type"]:
                    if int_feat in row:
                        row[int_feat] = int(row[int_feat])

                X = pd.DataFrame([row], columns=feature_names)
                pred_class = int(model.predict(X)[0])
                probs = model.predict_proba(X)[0].tolist()

                prob_dict = {i: round(probs[i], 4) for i in range(len(probs))}

                response_payload = {
                    "predicted_class": pred_class,
                    "recommendation": recommendations[pred_class],
                    "probabilities": prob_dict,
                    "features_used": row
                }

                self.send_response(200)
                self._send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(response_payload).encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self._send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": f"Inference failure: {e}"}).encode("utf-8"))
        else:
            self.send_response(404)
            self._send_cors_headers()
            self.end_headers()

def run(port=8000):
    load_model()
    server_address = ("", port)
    httpd = HTTPServer(server_address, MLRequestHandler)
    print(f"[ML Server] Mind Mate Personalization Server listening on http://localhost:{port}/")
    print(f"[ML Server] Ready for real-time telemetry inference from Mind Mate frontend.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[ML Server] Shutting down.")
        httpd.server_close()

if __name__ == "__main__":
    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run(port)
