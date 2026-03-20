import Link from "next/link";
import { Shield, LayoutDashboard, Zap, Activity, Settings, Plus, Github, ExternalLink } from "lucide-react";
import AppDashboardCard from "@/components/AppDashboardCard";

export default function DashboardPage({ params }: { params: { app_id: string[] } }) {
  // In a real app, we'd fetch the registration record from Neon DB here.
  // For the validation test, we'll show a placeholder dashboard.
  
  const appId = params.app_id ? params.app_id.join("/") : "facebook/react";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors">
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 hidden lg:flex flex-col">
        <div className="p-6 h-20 flex items-center gap-3 border-b border-gray-50 dark:border-gray-800">
          <div className="bg-blue-600 p-1.5 rounded-lg">
             <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight dark:text-white">CloudSentinel</span>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Managed Apps" active />
          <SidebarItem icon={<Zap size={20} />} label="Chaos Testing" />
          <SidebarItem icon={<Activity size={20} />} label="Audit Logs" />
          <SidebarItem icon={<Settings size={20} />} label="Settings" />
        </nav>

        <div className="p-6 border-t border-gray-50 dark:border-gray-800">
          <Link href="/onboard" className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
            <Plus size={18} />
            Add New App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-20 px-8 flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-gray-900/80">
          <h1 className="text-xl font-bold dark:text-white flex items-center gap-3">
             <LayoutDashboard className="text-blue-600" size={20}/>
             App Dashboard
          </h1>
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
               JD
             </div>
          </div>
        </header>

        {/* Dash Content */}
        <div className="p-8 max-w-6xl mx-auto space-y-8">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <span>Dashboard</span>
                  <span>/</span>
                  <span>Applications</span>
                </nav>
                <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                  {appId.split("/")[1]} Overview
                </h2>
              </div>
              <div className="flex gap-3">
                 <button className="px-4 py-2 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-all flex items-center gap-2">
                   <Settings size={16} />
                   Config
                 </button>
                 <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 font-bold transition-all">
                   Run Experiment
                 </button>
              </div>
           </div>

           {/* Metrics Row */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard label="mTLS Traffic" value="842.1k" unit="req/s" status="up" />
              <MetricCard label="Identity Rotations" value="12" unit="today" status="stable" />
              <MetricCard label="Encryption Delay" value="1.2" unit="ms avg" status="up" />
           </div>

           {/* App Control Card */}
           <div className="mt-8">
              <AppDashboardCard 
                appId={appId}
                spiffeId={`spiffe://cloudsentinel.io/app/${appId}`}
                vaultKeyName={appId.replace("/", "-")}
                stack="nodejs"
              />
           </div>

           {/* Activity Log Placeholder */}
           <div className="mt-12 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Activity size={18} className="text-purple-500" />
                Recent Security Events
              </h3>
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Event Type</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">Identity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
                    <ActivityRow type="APP_REGISTERED" status="Success" time="Just now" id={appId} />
                    <ActivityRow type="SVID_ISSUED" status="Success" time="2 mins ago" id={appId} />
                    <ActivityRow type="TRANSIT_KEY_CREATED" status="Success" time="5 mins ago" id={appId} />
                  </tbody>
                </table>
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
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
        active 
          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
          : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function MetricCard({ label, value, unit, status }: { label: string, value: string, unit: string, status: "up" | "down" | "stable" }) {
  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-lg">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black">{value}</span>
        <span className="text-sm text-gray-400">{unit}</span>
      </div>
       <div className={`mt-4 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-bold ${
         status === "up" ? "bg-green-50 text-green-600 dark:bg-green-900/20" :
         status === "down" ? "bg-red-50 text-red-600 dark:bg-red-900/20" :
         "bg-gray-100 text-gray-600 dark:bg-gray-800"
       }`}>
         <div className={`h-1.5 w-1.5 rounded-full ${
           status === "up" ? "bg-green-500" : status === "down" ? "bg-red-500" : "bg-gray-400"
         }`} />
         {status.toUpperCase()}
       </div>
    </div>
  );
}

function ActivityRow({ type, status, time, id }: { type: string, status: string, time: string, id: string }) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
      <td className="px-6 py-4 font-mono text-xs text-blue-600 dark:text-blue-400">{type}</td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold">
           {status}
        </span>
      </td>
      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{time}</td>
      <td className="px-6 py-4 text-gray-400 text-xs font-mono">{id}</td>
    </tr>
  );
}
