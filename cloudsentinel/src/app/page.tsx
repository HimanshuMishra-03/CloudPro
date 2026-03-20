import Link from "next/link";
import { Shield, ShieldCheck, Zap, Lock, BarChart3, Github } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 selection:bg-blue-100 dark:selection:bg-blue-900/40">
      {/* Navigation */}
      <header className="px-6 lg:px-12 h-20 flex items-center border-b border-gray-100 dark:border-gray-900/50 backdrop-blur-sm sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80">
        <Link className="flex items-center justify-center gap-2 group" href="#">
          <div className="bg-blue-600 p-1.5 rounded-lg group-hover:rotate-6 transition-transform">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">CloudSentinel</span>
        </Link>
        <nav className="ml-auto flex gap-8">
          <Link className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors" href="#features">
            Features
          </Link>
          <Link className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity" href="/dashboard">
            Open Dashboard
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 lg:py-32 flex flex-col items-center px-6">
          <div className="max-w-4xl text-center space-y-8">
             <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold tracking-widest uppercase mb-4 animate-in fade-in slide-in-from-bottom-2">
              <span>Zero-Trust Infrastructure Testing</span>
            </div>
            <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-4 duration-700">
               Secure your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400">Workload</span> with Chaos.
            </h1>
            <p className="max-w-[700px] text-xl text-gray-500 dark:text-gray-400 mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
              The only platform that combines SPIFFE/SPIRE identity, OPA policy enforcement, and Vault encryption with automated chaos experiments. 
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <Link
                href="/dashboard"
                className="inline-flex h-14 items-center justify-center rounded-2xl bg-blue-600 px-10 text-lg font-bold text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95"
              >
                Go to Dashboard
              </Link>
              <Link
                href="https://github.com"
                target="_blank"
                className="inline-flex h-14 items-center justify-center rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-10 text-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95 gap-2"
              >
                <Github className="w-5 h-5" />
                View Docs
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="w-full py-24 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<ShieldCheck className="w-8 h-8 text-blue-600" />}
                title="SPIFFE Identity"
                description="Issue short-lived, cryptographic identities to every service. No more static API keys or passwords."
              />
              <FeatureCard 
                icon={<Lock className="w-8 h-8 text-cyan-500" />}
                title="Vault Encryption"
                description="User-owned Key Encryption Keys (KEK) generated automatically in HashiCorp Vault for client-side encryption."
              />
              <FeatureCard 
                icon={<Zap className="w-8 h-8 text-yellow-500" />}
                title="Chaos Testing"
                description="Simulate infrastructure failures, latency spikes, and network partitions to build resilience by design."
              />
              <FeatureCard 
                icon={<BarChart3 className="w-8 h-8 text-purple-500" />}
                title="Audit Logging"
                description="Every registration and policy evaluation is streamed to Kafka for an immutable security audit trail."
              />
               <FeatureCard 
                icon={<Shield className="w-8 h-8 text-green-500" />}
                title="OPA Governance"
                description="Declarative policy enforcement on every workload registration using Open Policy Agent."
              />
               <FeatureCard 
                icon={<Lock className="w-8 h-8 text-red-500" />}
                title="Client-Side Privacy"
                description="Encryption happens at the edge. We never see your plaintext data or your master encryption keys."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t border-gray-100 dark:border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-6 max-w-7xl mx-auto w-full text-sm text-gray-500">
        <p>© 2026 CloudSentinel Engineering. All rights reserved.</p>
        <div className="flex gap-8">
          <Link className="hover:text-blue-600 transition-colors" href="#">Privacy</Link>
          <Link className="hover:text-blue-600 transition-colors" href="#">Terms</Link>
          <Link className="hover:text-blue-600 transition-colors" href="#">System Status</Link>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-blue-500/5 transition-all group">
      <div className="mb-4 inline-block group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
