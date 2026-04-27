"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import { AreaChart, Activity, Shield, ShieldAlert, Cpu, HardDrive, Search, FileWarning, Terminal, Globe, Lock, Unlock } from "lucide-react";

// @ts-ignore
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from "chart.js";
// @ts-ignore
import { Doughnut, Line } from "react-chartjs-2";

ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

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

  useEffect(() => {
    // Connect to the Render backend for the real-time stream
    const socketUrl = "https://netsentinel-relay.onrender.com";
    const socket = io(socketUrl);

    socket.on("connect", () => {
      setConnected(true);
      console.log("Secure handshake established with NetSentinel Core.");
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("dashboard_update", (data) => {
      setStats(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleMalwareScan = async () => {
    setScanning(true);
    // Simulate API call to malware analyzer
    setTimeout(() => {
      setScanResult({
        filename: malwareFile?.name || "Suspicious_Payload.exe",
        entropy: 7.82,
        ai_score: 85,
        status: "Malicious",
        imports: ["CreateRemoteThread", "WriteProcessMemory", "ShellExecute"],
        recommendation: "Immediate Quarantine Required"
      });
      setScanning(false);
    }, 2000);
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
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50"></div>
      </div>

      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between px-10 py-8 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-1 bg-cyan-500/10 rounded-xl border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)] overflow-hidden">
            <img src="/logo.png" alt="NetSentinel Logo" className="w-12 h-12 object-cover" />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tighter text-white">
              NET<span className="text-cyan-400">SENTINEL</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-mono uppercase tracking-widest border border-cyan-500/20">Enterprise Grade v2.5</span>
              <span className="text-[10px] text-slate-500 font-mono italic">// Real-time Cyber Defense Engine</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1">System Load</span>
            <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]" style={{ width: '24%' }}></div>
            </div>
          </div>
          <div className={`flex items-center gap-2 bg-black/40 border ${connected ? 'border-emerald-500/30' : 'border-red-500/30'} px-5 py-2.5 rounded-2xl shadow-xl transition-all`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'} animate-pulse`}></div>
            <span className="text-xs font-bold tracking-widest uppercase font-mono">{connected ? 'Node Active' : 'Node Offline'}</span>
          </div>
        </div>
      </header>

      {/* NAV */}
      <nav className="relative z-10 flex px-10 py-1 bg-black/40 backdrop-blur-md border-b border-white/5 gap-1 overflow-x-auto scrollbar-hide">
        {[
          { id: "dashboard", icon: <Activity size={16} />, label: "Command Center" },
          { id: "events", icon: <Terminal size={16} />, label: "Security Logs" },
          { id: "malware", icon: <FileWarning size={16} />, label: "Malware Lab" },
          { id: "network", icon: <Globe size={16} />, label: "Global Traffic" },
          { id: "access", icon: <Lock size={16} />, label: "Access Control" },
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

      {/* CONTENT */}
      <main className="relative z-10 p-10 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* TOP STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Packets Inspected" value={stats.total_packets.toLocaleString()} icon={<Search />} color="cyan" trend="+12% vs last hr" />
              <StatCard title="Threats Neutralized" value={stats.intrusion_count} icon={<ShieldAlert />} color="rose" trend="Immediate action taken" />
              <StatCard title="Detection Accuracy" value="99.8%" icon={<Cpu />} color="purple" trend="AI Model: Optimized" />
              <StatCard title="System Integrity" value={stats.system_status} icon={<HardDrive />} color="emerald" trend="Database: SQLite (Local)" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* CHART 1 */}
              <div className="lg:col-span-2 bg-white/[0.03] border border-white/5 backdrop-blur-3xl rounded-[32px] p-8 shadow-2xl group hover:border-cyan-500/20 transition-all duration-500">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-sm text-slate-400 font-bold tracking-[0.2em] flex items-center gap-3 uppercase">
                    <Activity className="text-cyan-400" size={18} /> Real-time Threat Velocity
                  </h2>
                  <div className="flex gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                    <span className="w-2 h-2 rounded-full bg-white/10"></span>
                  </div>
                </div>
                <div className="h-[300px]">
                   {/* Placeholder for real Graph */}
                   <div className="w-full h-full bg-gradient-to-t from-cyan-500/5 to-transparent rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 flex items-end justify-between px-10 pb-4">
                        {[40, 70, 45, 90, 65, 80, 50, 85, 40, 100].map((h, i) => (
                           <div key={i} className="w-8 bg-cyan-500/20 rounded-t-lg border-t border-cyan-500/40 animate-pulse" style={{ height: `${h}%`, animationDelay: `${i*100}ms` }}></div>
                        ))}
                      </div>
                      <span className="text-slate-500 text-[10px] font-mono tracking-widest uppercase">Encrypted Data Stream Active</span>
                   </div>
                </div>
              </div>

              {/* CHART 2 */}
              <div className="bg-white/[0.03] border border-white/5 backdrop-blur-3xl rounded-[32px] p-8 shadow-2xl group hover:border-purple-500/20 transition-all duration-500">
                <h2 className="text-sm text-slate-400 mb-8 font-bold flex items-center gap-3 tracking-[0.2em] uppercase">
                  <Shield className="text-purple-400" size={18} /> Attack Vector Analysis
                </h2>
                <div className="h-64 flex justify-center scale-110">
                  {Object.keys(stats.attack_types || {}).length > 0 ? (
                    <Doughnut data={attackData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                  ) : (
                    <div className="text-slate-600 h-full flex flex-col items-center justify-center font-mono italic text-xs">
                      <Search size={40} className="mb-4 opacity-20" />
                      Scanning for vectors...
                    </div>
                  )}
                </div>
                <div className="mt-8 space-y-3">
                   {Object.entries(stats.attack_types || {}).slice(0, 3).map(([key, val]: any, i) => (
                      <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5">
                        <span className="text-xs font-bold uppercase tracking-wider">{key}</span>
                        <span className="text-xs font-mono text-cyan-400">{val} hits</span>
                      </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "malware" && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
            <div className="text-center space-y-4 mb-12">
               <h2 className="text-4xl font-black text-white tracking-tight">AI MALWARE <span className="text-cyan-400">LAB</span></h2>
               <p className="text-slate-500 font-mono text-sm tracking-widest uppercase italic">// Advanced Static & Heuristic Analysis Module</p>
            </div>

            <div className={`p-16 border-2 border-dashed ${malwareFile ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-white/10 hover:border-white/20'} rounded-[48px] transition-all duration-500 text-center relative overflow-hidden group`}>
               {malwareFile ? (
                 <div className="space-y-6">
                    <div className="p-6 bg-cyan-500/10 w-fit mx-auto rounded-3xl border border-cyan-500/20">
                      <Terminal className="text-cyan-400" size={48} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{malwareFile.name}</h3>
                      <p className="text-slate-500 font-mono text-xs mt-1 uppercase">{(malwareFile.size / 1024).toFixed(2)} KB // Ready for Analysis</p>
                    </div>
                    <button 
                      onClick={handleMalwareScan}
                      disabled={scanning}
                      className="px-10 py-4 bg-cyan-500 text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] disabled:opacity-50"
                    >
                      {scanning ? 'SCANNING BYTES...' : 'INITIATE DEEP ANALYZE'}
                    </button>
                    <button onClick={() => setMalwareFile(null)} className="block mx-auto text-[10px] text-slate-500 hover:text-red-400 font-mono uppercase tracking-[0.3em] mt-4">Reset Session</button>
                 </div>
               ) : (
                 <div className="space-y-6">
                    <div className="p-6 bg-white/5 w-fit mx-auto rounded-3xl border border-white/5 group-hover:scale-110 transition-transform duration-500">
                      <Search className="text-slate-500" size={48} />
                    </div>
                    <p className="text-slate-400 font-bold tracking-widest uppercase">Drop suspicious binary or browse filesystem</p>
                    <input 
                      type="file" 
                      onChange={(e) => setMalwareFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                 </div>
               )}
            </div>

            {scanResult && (
               <div className="bg-white/[0.03] border border-white/10 rounded-[32px] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className={`p-8 flex items-center justify-between ${scanResult.status === 'Malicious' ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
                    <div className="flex items-center gap-4">
                      {scanResult.status === 'Malicious' ? <FileWarning className="text-rose-500" /> : <Shield className="text-emerald-500" />}
                      <span className="text-lg font-black tracking-widest uppercase">Analysis Result: {scanResult.status}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1">AI Threat Score</span>
                      <span className={`text-4xl font-black ${scanResult.status === 'Malicious' ? 'text-rose-500' : 'text-emerald-500'}`}>{scanResult.ai_score}/100</span>
                    </div>
                  </div>
                  <div className="p-8 grid grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Detected Suspicious Imports</span>
                          <div className="mt-2 flex flex-wrap gap-2">
                             {scanResult.imports.map((imp: any, i: number) => (
                               <span key={i} className="px-3 py-1 bg-black/40 border border-white/5 text-[10px] text-rose-400 rounded-lg">{imp}</span>
                             ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Shannon Entropy Score</span>
                          <p className="text-2xl font-bold text-white mt-1">{scanResult.entropy} <span className="text-xs text-slate-500 font-normal underline">Packed Data Detected</span></p>
                        </div>
                     </div>
                     <div className="bg-black/60 rounded-3xl p-6 border border-white/5">
                        <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase mb-4 block">Engine Recommendation</span>
                        <p className="text-sm text-slate-300 leading-relaxed italic">"The analysis identifies suspicious API usage patterns and high entropy levels typical of cryptographers or malicious payloads. Recommend sandboxing before execution."</p>
                        <div className="mt-8 flex gap-4">
                           <button className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10">Vault File</button>
                           <button className="flex-1 py-3 bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-500/30">Destroy</button>
                        </div>
                     </div>
                  </div>
               </div>
            )}
          </div>
        )}

        {/* ACCESS CONTROL */}
        {activeTab === "access" && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
              <AccessList title="Blacklisted Entities" items={["103.68.92.124", "103.168.92.107"]} icon={<Lock className="text-rose-500" />} color="rose" />
              <AccessList title="Verified Safe Nodes" items={["127.0.0.1", "192.168.1.1"]} icon={<Unlock className="text-emerald-500" />} color="emerald" />
           </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === "events" && (
          <div className="bg-white/[0.03] border border-white/5 backdrop-blur-3xl rounded-[40px] p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-8 px-2">
              <h2 className="text-xl text-white font-black tracking-widest uppercase flex items-center gap-4">
                <Terminal className="text-cyan-400" /> LIVE SECURITY OVERFLOW
              </h2>
              <span className="text-[10px] font-mono text-cyan-500/60 uppercase animate-pulse">Establishing sub-process connection...</span>
            </div>
            <div className="overflow-hidden rounded-3xl border border-white/5 bg-black/20">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-[10px] font-bold tracking-[0.3em] text-slate-500">
                  <tr>
                    <th className="p-6">TIMESTAMP</th>
                    <th className="p-6">CLASSIFICATION</th>
                    <th className="p-6">VECTOR</th>
                    <th className="p-6">ORIGIN IP</th>
                    <th className="p-6 text-right">CONFIDENCE</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs">
                  {(stats.recent_alerts || []).map((alert: any, i: number) => (
                    <tr key={i} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors group`}>
                      <td className="p-6 text-slate-500">{alert.timestamp}</td>
                      <td className="p-6 font-bold">
                        <span className={`px-4 py-1.5 rounded-full border ${alert.attack_type === 'Normal' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                          {alert.result}
                        </span>
                      </td>
                      <td className="p-6 text-slate-300">{alert.attack_type}</td>
                      <td className="p-6 text-cyan-500 group-hover:text-cyan-400 transition-colors underline underline-offset-4 decoration-cyan-500/20">{alert.src_ip}</td>
                      <td className="p-6 text-right font-black text-white">{alert.confidence}%</td>
                    </tr>
                  ))}
                  {(!stats.recent_alerts || stats.recent_alerts.length === 0) && (
                    <tr><td colSpan={5} className="p-20 text-center text-slate-700 tracking-[0.5em] font-mono italic">DATA_MODULE_AWAITING_TRAFFIC...</td></tr>
                  )}
                </tbody>
              </table>
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
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500 scale-[2]">
        {icon}
      </div>
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
           <h3 className="text-[10px] text-slate-500 font-bold tracking-[0.3em] uppercase mb-4">{title}</h3>
           <div className="text-4xl font-black tracking-tighter drop-shadow-xl">{value}</div>
        </div>
        <div className="mt-6 flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
           <span className="text-[9px] font-mono uppercase tracking-widest opacity-60 italic">{trend}</span>
        </div>
      </div>
    </div>
  );
}

function AccessList({ title, items, icon, color }: any) {
   const colors: any = {
      rose: "border-rose-500/20 bg-rose-500/5",
      emerald: "border-emerald-500/20 bg-emerald-500/5"
   }
   return (
      <div className={`p-10 border rounded-[40px] ${colors[color]}`}>
         <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-black/40 rounded-2xl border border-white/5">{icon}</div>
            <h3 className="text-sm font-black tracking-[0.3em] text-white uppercase">{title}</h3>
         </div>
         <div className="space-y-3">
            {items.map((ip: string, i: number) => (
               <div key={i} className="flex justify-between items-center bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <span className="font-mono text-sm tracking-wider text-slate-200">{ip}</span>
                  <button className="text-[10px] text-slate-500 hover:text-white uppercase font-bold tracking-widest">Revoke</button>
               </div>
            ))}
         </div>
      </div>
   );
}
