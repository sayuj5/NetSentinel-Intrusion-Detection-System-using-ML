import os
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from datetime import datetime
import logging

# Configure logic for Pure Serverless (No DB)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - SENTINEL-LITE - %(levelname)s - %(message)s')

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "cyber-vault-secret-key")

# Enable CORS for cross-origin streaming
CORS(app)

# Use memory-efficient WebSocket management
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='gevent')

@app.route('/api/realtime_data', methods=['POST'])
@app.route('/realtime_data', methods=['POST'])
def receive_data():
    """
    Acts as a high-speed relay. Receives data from the Windows node 
    and broadcasts it to all live dashboards instantly.
    """
    data = request.json
    if not data:
        return jsonify({"status": "error"}), 400

    # Add timestamp if it doesn't exist
    if 'timestamp' not in data:
        data['timestamp'] = datetime.now().strftime('%H:%M:%S')

    # BROADCAST: Send live data to all connected Dashboard clients
    socketio.emit('dashboard_update', data)
    
    logging.info(f"Relayed event: {data.get('attack_type', 'Traffic')} from {data.get('src_ip')}")
    
    return jsonify({
        "status": "relayed", 
        "architecture": "serverless_pure_stream",
        "persistent_storage": "disabled"
    })

@app.route('/api/history', methods=['GET'])
def get_history():
    """Returns a placeholder as we are in No-DB mode"""
    return jsonify({"message": "Persistence disabled in Serverless Lite mode. Watch live stream for data."})

@app.route('/')
def index():
    return "NetSentinel Serverless Relay is ONLINE. No Database required."

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5055))
    socketio.run(app, host='0.0.0.0', port=port, debug=True)
