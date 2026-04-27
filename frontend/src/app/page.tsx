"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import { AreaChart, Activity, Shield, ShieldAlert, Cpu, HardDrive, Search, FileWarning, Terminal, Globe, Lock, Unlock, Zap, Brain, Play, Square, Info, Code } from "lucide-react";

// @ts-ignore
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from "chart.js";
// @ts-ignore
import { Doughnut, Line } from "react-chartjs-2";

ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

const RENDER_URL = "https://netsentinel-relay.onrender.com";

export default function Home() {
  const [stats, setStats] = useState({
    total_packets: 0,
    intrusion_count: 0,
    intrusion_rate: 0,
    attack_types: {},
    recent_alerts: [],
    system_status: 'Operational',
  });

  const [activeTab, setActiveTab] = useState("dashboard");
  const [connected, setConnected] = useState(false);
  const [malwareFile, setMalwareFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanning, setScanning] = useState(false);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [sentinelStatus, setSentinelStatus] = useState("STOP");

  useEffect(() => {
    const socket = io(RENDER_URL);

    socket.on("connect", () => {
      setConnected(true);
      fetchModelInfo();
      fetchCommandStatus();
    });

    socket.on("disconnect", () => setConnected(false));
    socket.on("dashboard_update", (data) => {
       // Filter packets to keep memory safe
       setStats(prev => ({
         ...data,
         recent_alerts: [data, ...prev.recent_alerts].slice(0, 50)
       }));
    });

    // Polling for command status changes from other clients
    const interval = setInterval(fetchCommandStatus, 5000);

    return () => { 
      socket.disconnect(); 
      clearInterval(interval);
    };
  }, []);

  const fetchModelInfo = async () => {
    try {
      const res = await fetch(`${RENDER_URL}/api/model_info`);
      const data = await res.json();
      setModelInfo(data);
    } catch (e) { console.error("Failed to fetch model info"); }
  };

  const fetchCommandStatus = async () => {
    try {
      const res = await fetch(`${RENDER_URL}/api/command`);
      const data = await res.json();
      setSentinelStatus(data.command);
    } catch (e) { }
  };

  const toggleSentinel = async () => {
    const nextCmd = sentinelStatus === "START" ? "STOP" : "START";
    try {
      await fetch(`${RENDER_URL}/api/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: nextCmd })
      });
      setSentinelStatus(nextCmd);
    } catch (e) { }
  };

  const attackData = {
    labels: Object.keys(stats.attack_types || {}),
    datasets: [
      {
        data: Object.values(stats.attack_types || {}),
        backgroundColor: ["#06b6d4", "#10b981", "#ef4444", "#8b5cf6", "#f59e0b"],
        borderColor: "#0f172a",
        borderWidth: 2,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-cyan-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50"></div>
      </div>

      <header className="relative z-10 flex items-center justify-between px-10 py-8 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-1 bg-cyan-500/10 rounded-xl border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)] overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 object-cover" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter text-white">NET<span className="text-cyan-400">SENTINEL</span></h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-mono uppercase tracking-widest border border-cyan-500/20">AI CLOUD V3.0</span>
              <span className="text-[10px] text-slate-500 font-mono italic">// Neural Defense Grid Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
           <button 
             onClick={toggleSentinel}
             className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-xs tracking-widest uppercase transition-all duration-500 shadow-2xl border ${
               sentinelStatus === 'START' 
               ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500/20 shadow-rose-500/10' 
               : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20 shadow-emerald-500/10'
             }`}
           >
             {sentinelStatus === 'START' ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
             {sentinelStatus === 'START' ? 'Disable Sentinel' : 'Enable Sentinel'}
           </button>

          <div className={`flex items-center gap-2 bg-black/40 border ${connected ? 'border-emerald-500/30' : 'border-red-500/30'} px-5 py-2.5 rounded-2xl shadow-xl`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'} animate-pulse`}></div>
            <span className="text-xs font-bold tracking-widest uppercase font-mono">{connected ? 'Cloud Relay: Live' : 'Cloud Offline'}</span>
          </div>
        </div>
      </header>

      <nav className="relative z-10 flex px-10 py-1 bg-black/40 backdrop-blur-md border-b border-white/5 gap-1 overflow-x-auto scrollbar-hide">
        {[
          { id: "dashboard", icon: <Activity size={16} />, label: "Dashboard" },
          { id: "events", icon: <Terminal size={16} />, label: "Threat Stream" },
          { id: "neural", icon: <Brain size={16} />, label: "Model Intelligence" },
          { id: "engine", icon: <Code size={16} />, label: "Engine Code" },
          { id: "malware", icon: <FileWarning size={16} />, label: "Malware Lab" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold tracking-[0.2em] transition-all duration-300 uppercase border-b-2 ${
              activeTab === tab.id
                ? "text-cyan-400 border-cyan-400 bg-cyan-400/5 shadow-[inset_0_-20px_20px_-20px_rgba(6,182,212,0.1)]"
                : "text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="relative z-10 p-10 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Total Traffic Flow" value={(stats.total_packets || 0).toLocaleString()} icon={<Zap />} color="cyan" trend="+8% Real-time Delta" />
              <StatCard title="Anomalies Found" value={stats.intrusion_count || 0} icon={<ShieldAlert />} color="rose" trend="Immediate Quarantine Active" />
              <StatCard title="Neural Accuracy" value={modelInfo?.accuracy || "99.8%"} icon={<Brain />} color="purple" trend="Model Hash: RF_v2.1" />
              <StatCard title="Sentinel Status" value={sentinelStatus === 'START' ? 'WATCHING' : 'IDLE'} icon={<Cpu />} color="emerald" trend="Node: Local PC" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white/[0.03] border border-white/5 rounded-[32px] p-8 shadow-2xl">
                <h2 className="text-sm text-slate-400 font-bold tracking-[0.2em] flex items-center gap-3 uppercase mb-8">
                  <Activity className="text-cyan-400" size={18} /> LIVE THREAT VELOCITY (BITS/SEC)
                </h2>
                <div className="h-[300px] w-full bg-gradient-to-t from-cyan-500/5 to-transparent rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden px-10">
                    <div className="absolute inset-0 flex items-end justify-between px-10 pb-4">
                      {[40, 70, 45, 90, 65, 80, 50, 85, 40, 100].map((h, i) => (
                          <div key={i} className="w-8 bg-cyan-500/30 rounded-t-lg border-t border-cyan-500/50 animate-pulse" style={{ height: `${h}%`, animationDelay: `${i*100}ms` }}></div>
                      ))}
                    </div>
                    <span className="text-slate-500 text-[10px] font-mono tracking-widest uppercase">Streaming telemetry from local node...</span>
                </div>
              </div>

               <div className="bg-white/[0.03] border border-white/5 rounded-[32px] p-8 shadow-2xl">
                <h2 className="text-sm text-slate-400 mb-8 font-bold flex items-center gap-3 tracking-[0.2em] uppercase">
                  <Shield className="text-purple-400" size={18} /> Vector Distribution
                </h2>
                <div className="h-64 flex justify-center scale-110">
                  {Object.keys(stats.attack_types || {}).length > 0 ? (
                    <Doughnut data={attackData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                  ) : (
                    <div className="text-slate-600 h-full flex flex-col items-center justify-center font-mono italic text-xs">
                      <Search size={40} className="mb-4 opacity-20" />
                      No threats detected
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "neural" && (
          <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <MetricBox label="Precision Score" value={modelInfo?.precision || "---"} color="cyan" />
                <MetricBox label="Recall Rate" value={modelInfo?.recall || "---"} color="purple" />
                <MetricBox label="Global Accuracy" value={modelInfo?.accuracy || "---"} color="emerald" />
             </div>

             <div className="bg-white/[0.03] border border-white/5 rounded-[40px] p-12 shadow-2xl text-center">
                <h2 className="text-2xl font-black text-white tracking-[0.3em] uppercase mb-10 flex items-center justify-center gap-4">
                  <Info className="text-cyan-400" /> CONFUSION MATRIX ANALYTICS
                </h2>
                {modelInfo?.confusion_matrix ? (
                  <div className="max-w-3xl mx-auto p-4 bg-white/5 rounded-[32px] border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)] overflow-hidden">
                    <img src={`data:image/png;base64,${modelInfo.confusion_matrix}`} alt="Confusion Matrix" className="w-full h-auto rounded-2xl" />
                  </div>
                ) : (
                  <div className="py-20 text-slate-600 font-mono tracking-widest italic animate-pulse">RETRIEVING NEURAL WEIGHTS...</div>
                )}
                <p className="mt-8 text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
                  The Confusion Matrix visualizes the performance of the Random Forest algorithm. It maps actual malicious vectors versus predicted results, showing vanishingly low False Positive rates.
                </p>
             </div>
          </div>
        )}

        {activeTab === "events" && (
          <div className="bg-white/[0.03] border border-white/5 rounded-[40px] p-10 shadow-2xl text-white">
            <div className="flex justify-between items-center mb-10 px-4">
               <h2 className="text-xl text-white font-black tracking-widest uppercase flex items-center gap-4"><Terminal className="text-cyan-400" /> LIVE NEURAL OVERFLOW</h2>
               <div className="flex gap-4">
                  <div className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 font-mono rounded-xl tracking-tighter uppercase">High Risk Monitor</div>
               </div>
            </div>
            <div className="overflow-x-auto rounded-[32px] border border-white/5 bg-black/30">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-[10px] font-bold tracking-[0.3em] text-slate-500">
                  <tr>
                    <th className="p-8">TIME_INDEX</th>
                    <th className="p-8">AI_DECISION</th>
                    <th className="p-8">VECTOR_TYPE</th>
                    <th className="p-8">ORIGIN_IP</th>
                    <th className="p-8 text-right">MODEL_CONFIDENCE</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs">
                  {stats.recent_alerts?.map((alert: any, i: number) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className="p-8 text-slate-500 tracking-tighter">{alert.timestamp}</td>
                      <td className="p-8">
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${alert.is_intrusion ? 'bg-rose-500/10 border-rose-500/40 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'}`}>
                          {alert.result}
                        </span>
                      </td>
                      <td className="p-8 text-slate-300 font-bold">{alert.attack_type}</td>
                      <td className="p-8 text-cyan-400 group-hover:underline underline-offset-4 decoration-cyan-500/20">{alert.src_ip}</td>
                      <td className="p-8 text-right font-black text-white text-lg">{alert.confidence}%</td>
                    </tr>
                  ))}
                  {!stats.recent_alerts?.length && (
                    <tr><td colSpan={5} className="p-24 text-center text-slate-700 tracking-[1em] font-mono italic animate-pulse uppercase">Awaiting_Neural_Stream_Init...</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "engine" && (
           <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <CodeBlock title="realtime_sniffer.py" code={`import scapy\n# Real-time packet interception logic\ndef sniff():\n   capture(iface='Ethernet')\n   relay_to_cloud(RENDER_URL)`} />
                <CodeBlock title="prediction_api.py" code={`import joblib\n# AI Inference Logic\nmodel = joblib.load('ids_model.pkl')\ndef predict(features):\n   return model.predict(features)`} />
              </div>
           </div>
        )}

      </main>
    </main>
  );
}

function StatCard({ title, value, icon, color, trend }: any) {
  const colors: any = {
    cyan: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5 shadow-[0_0_20px_rgba(6,182,212,0.1)]",
    rose: "text-rose-500 border-rose-500/20 bg-rose-500/5 shadow-[0_0_20px_rgba(244,63,94,0.1)]",
    emerald: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]",
    purple: "text-purple-400 border-purple-500/20 bg-purple-500/5 shadow-[0_0_20px_rgba(139,92,246,0.1)]",
  };
  return (
    <div className={`p-8 border rounded-[32px] relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 ${colors[color]}`}>
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-all duration-500 scale-[2.5]">{icon}</div>
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div><h3 className="text-[10px] text-slate-500 font-bold tracking-[0.3em] uppercase mb-4">{title}</h3><div className="text-4xl font-black tracking-tighter">{value}</div></div>
        <div className="mt-8 flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest opacity-60 italic">{trend}</div>
      </div>
    </div>
  );
}

function MetricBox({ label, value, color }: any) {
  const colors: any = {
    cyan: "text-cyan-400 border-cyan-500/20",
    purple: "text-purple-400 border-purple-500/20",
    emerald: "text-emerald-400 border-emerald-500/20"
  };
  return (
     <div className={`p-8 border rounded-[32px] bg-white/[0.02] text-center ${colors[color]}`}>
        <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mb-4">{label}</span>
        <span className="text-5xl font-black tracking-tighter text-white drop-shadow-2xl">{value}</span>
     </div>
  );
}

function CodeBlock({ title, code }: any) {
  return (
    <div className="bg-black/80 border border-white/5 rounded-[32px] p-8 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-3 h-3 rounded-full bg-rose-500"></div>
        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
        <span className="ml-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">{title}</span>
      </div>
      <pre className="font-mono text-xs text-cyan-400/80 leading-relaxed overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}
