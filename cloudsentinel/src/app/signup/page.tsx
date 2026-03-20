"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Github, Loader2, ArrowRight, CheckCircle2, RefreshCw } from "lucide-react";

export default function SignupPage() {
  const [phase, setPhase] = useState<"INTRO" | "LOGIN" | "AUTHORIZE" | "CONNECTING" | "SUCCESS">("INTRO");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleStart = () => setPhase("LOGIN");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setPhase("AUTHORIZE");
  };

  const handleAuthorize = async () => {
    setPhase("CONNECTING");
    // High-fidelity simulation of connection
    await new Promise(r => setTimeout(r, 1200));
    setPhase("SUCCESS");
    await new Promise(r => setTimeout(r, 1000));
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-gray-950 flex flex-col items-center justify-center p-6 selection:bg-blue-100 dark:selection:bg-blue-900/40 font-sans">
      {/* Brand */}
      <div className="absolute top-12 left-12 flex items-center gap-2">
        <div className="bg-black dark:bg-white p-1.5 rounded-md">
          <Shield className="h-4 w-4 text-white dark:text-black" />
        </div>
        <span className="font-bold text-sm tracking-tight dark:text-white">CloudSentinel</span>
      </div>

      <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {phase === "INTRO" && (
          <div className="text-center space-y-8">
            <div className="space-y-3">
              <h1 className="text-4xl font-black tracking-tighter dark:text-white">Join the <span className="text-blue-600">Zero-Trust</span> Era.</h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Connect your GitHub to start securing your workloads.</p>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[32px] p-10 shadow-2xl shadow-black/5 flex flex-col gap-6">
              <button
                onClick={handleStart}
                className="w-full h-14 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:opacity-90 transition-all active:scale-[0.98] shadow-xl shadow-black/10 group"
              >
                <Github className="w-6 h-6" />
                Continue with GitHub
                <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100 dark:border-gray-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-900 px-4 text-gray-400 font-bold tracking-widest">Enterprise Only</span>
                </div>
              </div>
              <button disabled className="w-full h-14 bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600 rounded-2xl font-bold text-lg border border-gray-100 dark:border-gray-800 cursor-not-allowed">
                SAML Single Sign-On
              </button>
            </div>
          </div>
        )}

        {phase === "LOGIN" && (
          <div className="animate-in fade-in zoom-in-95 duration-500 space-y-6">
            <div className="flex flex-col items-center gap-4 mb-2">
                <Github size={48} className="dark:text-white" />
                <h2 className="text-2xl font-bold dark:text-white">Sign in to GitHub</h2>
                <p className="text-sm text-gray-500">to continue to <span className="font-bold text-blue-600">CloudSentinel</span></p>
            </div>
            <form onSubmit={handleLogin} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-xl space-y-4">
               <div className="space-y-1.5">
                  <label className="text-sm font-bold dark:text-white">Username or email address</label>
                  <input 
                    required
                    type="text" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full h-10 px-3 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
               </div>
               <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold dark:text-white">Password</label>
                    <Link href="#" className="text-xs text-blue-600 hover:underline">Forgot password?</Link>
                  </div>
                  <input 
                    required
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full h-10 px-3 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
               </div>
               <button type="submit" className="w-full h-10 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm shadow-md transition-all active:scale-[0.98] mt-4">
                  Sign in
               </button>
            </form>
          </div>
        )}

        {phase === "AUTHORIZE" && (
          <div className="animate-in fade-in zoom-in-95 duration-500 space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[32px] overflow-hidden shadow-2xl">
               <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-center gap-6 relative">
                  <div className="h-12 w-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center border border-gray-100">
                    <Github size={24} />
                  </div>
                  <RefreshCw className="text-gray-300 h-5 w-5 animate-spin duration-[3000ms]" />
                  <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Shield size={24} className="text-white" />
                  </div>
               </div>
               <div className="p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black dark:text-white">Authorize CloudSentinel</h2>
                    <p className="text-gray-500 text-sm italic">cloudsentinel.io wants to access your account</p>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex gap-3 text-sm font-medium">
                      <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                      <span className="dark:text-white">Read access to public and private repositories</span>
                    </li>
                  </ul>
                  <div className="flex gap-3 pt-4">
                     <button onClick={() => setPhase("LOGIN")} className="flex-1 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 font-bold hover:bg-gray-100 transition-all">Cancel</button>
                     <button onClick={handleAuthorize} className="flex-2 px-8 h-12 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all">Authorize</button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {(phase === "CONNECTING" || phase === "SUCCESS") && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[32px] p-12 shadow-2xl text-center space-y-6">
              {phase === "CONNECTING" ? (
                <>
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                  <div className="space-y-2">
                    <p className="font-bold text-2xl dark:text-white">Connecting...</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-full w-fit mx-auto">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-2xl dark:text-white">Handshake Complete!</p>
                  </div>
                </>
              )}
            </div>
        )}
      </div>

      {/* Trust Badges */}
      <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-12 opacity-30 grayscale transition-all hover:opacity-60 hover:grayscale-0">
        <div className="flex items-center gap-2 font-black text-xs uppercase tracking-tighter dark:text-white">Vault</div>
        <div className="flex items-center gap-2 font-black text-xs uppercase tracking-tighter dark:text-white">SPIRE</div>
        <div className="flex items-center gap-2 font-black text-xs uppercase tracking-tighter dark:text-white">OPA</div>
        <div className="flex items-center gap-2 font-black text-xs uppercase tracking-tighter dark:text-white">Kafka</div>
      </div>
    </div>
  );
}
