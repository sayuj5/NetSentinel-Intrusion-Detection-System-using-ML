# 🛡️ NetSentinel: Professional Cyber-Defense Engine

NetSentinel is a state-of-the-art, **Serverless Hybrid Intrusion Detection System (IDS)** designed for real-time network monitoring and AI-driven threat analysis. Combining the power of a Windows-native scanning engine with a high-fidelity Next.js Cloud Dashboard, NetSentinel provides an enterprise-grade security experience.

## 🚀 Key Features
- **AI-Powered Detection**: Real-time packet inspection using the NSL-KDD optimized Random Forest model.
- **Serverless Hybrid Architecture**: Dashboard and Relay hosted on Vercel for global accessibility.
- **Windows Sentinel Node**: Lightweight local monitoring node optimized for Npcap performance.
- **AI Malware Lab**: Static heuristic scanning for suspicious binaries with AI threat scoring.
- **Glassmorphism UI**: High-fidelity dashboard with real-time threat velocity visualizations.

## 🏗️ Technical Architecture
NetSentinel operates on a **Distributed Streaming Model**:
1. **Sentinel Node (Local Windows)**: Sniffs raw packets, performs local AI inference, and pushes events to the cloud.
2. **Cloud Relay (Vercel Serverless)**: A Flask-based relay station that broadcasts security events via WebSockets.
3. **Command Center (Next.js)**: A premium React-based interface for live monitoring and malware analysis.

## 👥 Contributors & Roles

| Name | Role | Responsibility |
| :--- | :--- | :--- |
| **Sayuj Sur** | **Team Leader & Lead Architect** | Overall system design, Hybrid Cloud strategy, and project orchestration. |
| **Mabud Munshi** | **Backend & API Specialist** | Development of the Serverless Relay, Socket.io integration, and Cloud connectivity. |
| **Ujjwal Kumar Mishra** | **ML & Security Researcher** | AI Model pipeline, feature engineering, and Malware Analysis heuristic logic. |
| **Md Mehtab Baidya** | **Frontend & UI Developer** | Design and development of the glassmorphic Dashboard and real-time visualizations. |

## 🛠️ Quick Start

### 1. Cloud Deployment
Push this repository to **GitHub** and connect it to **Vercel**. The dashboard will be live instantly.

### 2. Local Setup (Windows)
```powershell
# Install requirements
pip install -r requirements.txt

# Start the Local AI Engine
python prediction_api.py

# Start the Windows Sentinel (Stream to Vercel)
$env:VERCEL_API_URL="https://your-vercel-app.vercel.app/api/realtime_data"
python engine/sniffer.py
```

## 🔐 License
This project is licensed under the MIT License. Developed for educational and security research purposes.
