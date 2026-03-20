"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Github, 
  ExternalLink, 
  Shield, 
  Activity, 
  Clock, 
  ArrowRight,
  ShieldAlert,
  Terminal,
  Server
} from "lucide-react";
import Navigation from "@/components/Navigation";

export default function Dashboard() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [githubConnected, setGithubConnected] = useState<boolean | null>(null);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/registrations");
      const data = await res.json();
      setRegistrations(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch registrations", e);
    } finally {
      setLoading(false);
    }
  };

  const checkGithubStatus = async () => {
    try {
      const res = await fetch("/api/github/status");
      const data = await res.json();
      setGithubConnected(data.connected);
      if (data.connected) {
        await fetchRegistrations();
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.error("Failed to check GitHub status", e);
      setGithubConnected(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkGithubStatus();
  }, []);

  const filteredProjects = registrations.filter(r => 
    (r.app_id || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-gray-950 font-sans">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter dark:text-white">Projects</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Manage your zero-trust application identities.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none w-64 transition-all shadow-sm"
              />
            </div>
            <Link 
              href="/dashboard/import"
              className="h-10 px-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-black/5"
            >
              <Plus size={16} />
              New Project
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-[24px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 animate-pulse" />
            ))}
          </div>
        ) : githubConnected === false ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[32px] p-12 text-center space-y-6 shadow-xl shadow-black/5">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-full w-fit mx-auto">
              <Github size={40} className="text-blue-600" />
            </div>
            <div className="max-w-md mx-auto space-y-3">
              <h2 className="text-2xl font-black tracking-tight dark:text-white">Connect GitHub to Start</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">To register applications and issue zero-trust identities, you need to link your GitHub account first.</p>
            </div>
              <Link
                href="/dashboard"
                className="inline-flex h-14 items-center justify-center rounded-2xl bg-blue-600 px-10 text-lg font-bold text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95"
              >
                Go to Dashboard
              </Link>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[32px] p-16 text-center space-y-6 shadow-xl shadow-black/5">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-full w-fit mx-auto">
              <Activity size={40} className="text-gray-400" />
            </div>
            <div className="max-w-md mx-auto space-y-3">
              <h2 className="text-2xl font-black tracking-tight dark:text-white">No Projects Found</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {search ? `No projects matching "${search}"` : "You haven't onboarded any applications yet. Start by importing a repository."}
              </p>
            </div>
            {!search && (
              <Link 
                href="/dashboard/import"
                className="inline-flex h-12 px-8 bg-blue-600 text-white rounded-xl font-black text-sm items-center gap-2 hover:translate-y-[-2px] transition-all shadow-xl shadow-blue-500/20 active:scale-95"
              >
                Import Repository
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link 
                key={project.app_id}
                href={`/dashboard/${project.app_id}`}
                className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[24px] p-6 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-2xl hover:shadow-blue-500/5 relative overflow-hidden"
              >
                {/* Status Dot */}
                <div className="absolute top-6 right-6 flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-tighter text-green-600">Secure</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-xl group-hover:bg-blue-600 transition-colors">
                      <Shield className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black tracking-tight truncate dark:text-white group-hover:text-blue-600 transition-colors">
                        {(project.app_id || "Unknown Project").split('/').pop()}
                      </h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">
                        {project.app_id}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 space-y-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Identity</p>
                      <div className="flex items-center gap-1.5">
                        <Terminal size={12} className="text-gray-400" />
                        <span className="text-xs font-bold dark:text-white truncate">SPIRE-v1</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 space-y-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Trust Zone</p>
                      <div className="flex items-center gap-1.5">
                        <Server size={12} className="text-gray-400" />
                        <span className="text-xs font-bold dark:text-white">Prod-AZ1</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                      <Clock size={12} />
                      Onboarded recently
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* System Stats Section */}
        {!loading && githubConnected && (
          <div className="mt-24 grid grid-cols-1 md:grid-cols-4 gap-6 pt-12 border-t border-gray-100 dark:border-gray-800">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Identities</p>
              <p className="text-3xl font-black dark:text-white">{registrations.length}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Security Score</p>
              <div className="flex items-end gap-2 text-green-500 font-black">
                <span className="text-3xl">98</span>
                <span className="mb-1 text-sm">/100</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chaos Experiments</p>
              <p className="text-3xl font-black dark:text-white">12</p>
            </div>
            <div className="space-y-2 group cursor-pointer">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Health</p>
              <div className="flex items-center gap-2">
                <div className="flex h-2 w-8 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-blue-600" />
                </div>
                <span className="text-xs font-bold dark:text-white">Stable</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
