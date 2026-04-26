# NetSentinel: Serverless Lite (Vercel)

This is a **high-speed streaming architecture** designed for deployment on Vercel with **zero database** dependencies.

## 1. How it Works
1. **Frontend**: A Next.js Dashboard hosted on Vercel.
2. **Backend**: A Serverless Relay (Flask) on Vercel.
3. **Windows Sentinel**: A local node that sniffs your Windows traffic and pushes events to the Cloud in real-time.
4. **Data Persistence**: NONE. This mode is purely for **Live Monitoring**. (If you refresh the dashboard, history is cleared).

## 2. Deploying to Vercel

1. **GitHub**: Push your project to a GitHub repository.
2. **Vercel**: Import the repository. Vercel will automatically set up the Next.js frontend and the Flask relay.

## 3. Running the Windows Sentinel

To start the monitoring on your Windows machine (Administrator PowerShell):

1. Install dependencies: `pip install -r requirements.txt`.
2. Start the AI Induction Engine:
   ```powershell
   python prediction_api.py
   ```
3. Start the Live Streamer:
   ```powershell
   # Replace with your actual Vercel app URL
   $env:VERCEL_API_URL="https://your-project.vercel.app/api/realtime_data"
   python engine/sniffer.py
   ```

## Advantages:
- **Fastest Setup**: No database to configure or pay for.
- **Pure Serverless**: Scales instantly.
- **Zero Overhead**: Minimal memory usage on Vercel.

---
**Deployment Final: Serverless Lite Streamer is READY.**
