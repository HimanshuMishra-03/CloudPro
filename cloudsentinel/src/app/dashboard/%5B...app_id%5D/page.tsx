"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Shield, 
  LayoutDashboard, 
  Zap, 
  Activity, 
  Settings, 
  Plus, 
  Lock,
  Unlock,
  RefreshCw,
  Clock,
  ChevronRight
} from "lucide-react";
import AppDashboardCard from "@/components/AppDashboardCard";

interface DataRecord {
  id: string;
  app_id: string;
  data_type: string;
  ciphertext: string;
  vault_key_version: number;
  write_latency_ms: number;
  created_at: string;
  payload?: any; // Decrypted payload
}

export default function DashboardPage({ params }: { params: { app_id: string[] } }) {
  const appId = params.app_id ? params.app_id.join("/") : "vercel/next.js";
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [decrypting, setDecrypting] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [appId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/data/list?app_id=${encodeURIComponent(appId)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setRecords(data);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async (recordId: string) => {
    setDecrypting(recordId);
    try {
      const res = await fetch(`/api/v1/data/read?record_id=${recordId}`);
      const data = await res.json();
      if (data.payload) {
        setRecords(prev => prev.map(r => r.id === recordId ? { ...r, payload: data.payload } : r));
      }
    } catch (error) {
      console.error("Decryption failed", error);
    } finally {
      setDecrypting(null);
    }
  };

  const generateMockWrite = async () => {
    try {
      await fetch("/api/v1/data/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_id: appId,
          data_type: "health_metric",
          payload: {
            cpu: (Math.random() * 100).toFixed(2),
            memory: (Math.random() * 100).toFixed(2),
            ts: Date.now()
          }
        })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-gray-950 flex transition-colors font-sans selection:bg-blue-100 dark:selection:bg-blue-900/40">
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6 h-16 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
          <div className="bg-blue-600 p-1.5 rounded-lg">
             <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-black tracking-tighter dark:text-white uppercase">Sentinel</span>
        </div>
        
        <nav className="flex-1 p-6 space-y-1">
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Managed Apps" active />
          <SidebarItem icon={<Zap size={18} />} label="Chaos Testing" />
          <SidebarItem icon={<Activity size={18} />} label="Zero-Trust Audit" />
          <SidebarItem icon={<Settings size={18} />} label="Settings" />
        </nav>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800">
          <Link href="/dashboard" className="flex items-center justify-center gap-2 w-full py-3 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white rounded-xl font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-700">
            <Plus size={18} />
            Connect New Repo
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-8 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 backdrop-blur-xl">
          <div className="flex items-center gap-3 text-sm font-bold">
             <span className="text-gray-400">Dashboard</span>
             <span className="text-gray-300">/</span>
             <span className="dark:text-white">Overview</span>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={fetchData} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <RefreshCw size={18} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
             </button>
             <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-white dark:border-gray-800 shadow-sm" />
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto w-full space-y-12">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                  {appId.split("/")[1]}
                </h2>
                <p className="text-gray-500 font-medium text-lg">{appId}</p>
              </div>
              <div className="flex gap-3">
                 <button onClick={generateMockWrite} className="px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl hover:border-blue-500 transition-all font-bold text-sm shadow-sm flex items-center gap-2">
                   <Plus size={16} className="text-blue-500" />
                   Push Metric
                 </button>
                 <button className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl hover:opacity-90 transition-all font-black text-sm shadow-xl flex items-center gap-2">
                   <Zap size={16} />
                   Start Chaos
                 </button>
              </div>
           </div>

           {/* Metrics Grid */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard label="mTLS Traffic" value="842.1k" unit="req/s" status="up" />
              <MetricCard label="Identity Rotations" value="12" unit="today" status="stable" />
              <MetricCard label="KEK Version" value={`v${records[0]?.vault_key_version || 1}`} unit="Active" status="up" />
           </div>

           {/* App Control Card */}
           <AppDashboardCard 
             appId={appId}
             spiffeId={`spiffe://cloudsentinel.io/app/${appId}`}
             vaultKeyName={appId.replace("/", "-")}
             stack="nodejs"
           />

           {/* Live Zero-Trust Audit Log */}
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black flex items-center gap-3 dark:text-white">
                  <Activity size={24} className="text-blue-500" />
                  Zero-Trust Audit Log
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] uppercase font-bold tracking-widest rounded-full">Flow 2 Verified</span>
                </h3>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="p-6 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-400">Encrypted Object Stream</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-tighter">Live from Vault</span>
                  </div>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {loading && records.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                      <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Streaming Envelopes...</p>
                    </div>
                  ) : records.length === 0 ? (
                    <div className="p-20 text-center space-y-4">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-3xl mx-auto flex items-center justify-center border border-gray-100 dark:border-gray-700">
                        <Lock className="text-gray-300" size={24} />
                      </div>
                      <p className="text-gray-500 font-medium">No data writes recorded for this app yet.</p>
                      <button onClick={generateMockWrite} className="text-blue-600 text-sm font-bold hover:underline">Push first metric</button>
                    </div>
                  ) : (
                    records.map(record => (
                      <div key={record.id} className="group p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="mt-1 h-10 w-10 shrink-0 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center border border-blue-100 dark:border-blue-800/50">
                               {record.payload ? <Unlock className="text-blue-600 text-sm" size={18} /> : <Lock className="text-blue-400" size={18} />}
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">{record.data_type}</span>
                                <span className="text-[10px] font-mono text-gray-400 truncate hidden sm:block">CID: {record.id.split('-')[0]}...</span>
                              </div>
                              <div className="bg-gray-100 dark:bg-gray-800/80 p-3 rounded-xl font-mono text-[11px] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800 break-all line-clamp-2 italic">
                                {record.payload ? JSON.stringify(record.payload) : record.ciphertext}
                              </div>
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                                   <Clock size={12} />
                                   {new Date(record.created_at).toLocaleTimeString()}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                   <Zap size={11} className="text-amber-500" />
                                   {record.write_latency_ms}ms latency
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => handleDecrypt(record.id)}
                            disabled={!!record.payload || decrypting === record.id}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
                              record.payload 
                                ? "bg-green-50 text-green-600 dark:bg-green-900/20 cursor-default" 
                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95"
                            }`}
                          >
                            {decrypting === record.id ? (
                              <RefreshCw size={14} className="animate-spin" />
                            ) : record.payload ? (
                              <>Verified</>
                            ) : (
                              <>Decrypt via Vault</>
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link 
      href="#" 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
        active 
          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm" 
          : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function MetricCard({ label, value, unit, status }: { label: string, value: string, unit: string, status: "up" | "down" | "stable" }) {
  return (
    <div className="p-8 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{value}</span>
        <span className="text-sm font-bold text-gray-400 uppercase">{unit}</span>
      </div>
       <div className={`mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase ${
         status === "up" ? "bg-green-50 text-green-600 dark:bg-green-900/20" :
         status === "down" ? "bg-red-50 text-red-600 dark:bg-red-900/20" :
         "bg-gray-100 text-gray-600 dark:bg-gray-800"
       }`}>
         <div className={`h-2 w-2 rounded-full ${
           status === "up" ? "bg-green-500 animate-pulse" : status === "down" ? "bg-red-500" : "bg-gray-400"
         }`} />
         {status}
       </div>
    </div>
  );
}
