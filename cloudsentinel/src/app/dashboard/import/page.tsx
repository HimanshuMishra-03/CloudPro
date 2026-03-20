"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Shield, 
  Github, 
  Loader2, 
  ChevronRight, 
  ChevronLeft,
  Box
} from "lucide-react";
import RepoInput from "@/components/RepoInput";

interface Repo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  language: string;
  stargazers_count: number;
  updated_at: string;
  html_url: string;
}

export default function ImportPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/github/repos");
      const data = await res.json();
      setRepos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch repos", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = (repoUrl: string) => {
    router.push(`/onboard?repo=${encodeURIComponent(repoUrl)}`);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-gray-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/40">
      {/* Header */}
      <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <ChevronLeft size={20} className="dark:text-white" />
          </Link>
          <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-800" />
          <h1 className="font-bold text-sm tracking-tight dark:text-white">Import Repository</h1>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 rounded-full">
              <Github size={12} className="text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-tighter">Connected</span>
           </div>
           <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border border-white dark:border-gray-800" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        <div className="space-y-4">
          <h2 className="text-4xl font-black tracking-tight dark:text-white">Let&apos;s build something.</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg max-w-2xl">To deploy a new project, paste a GitHub URL below or select from your connected account.</p>
        </div>

        {/* Action Bar - RepoInput handles both search and manual URL */}
        <div className="max-w-3xl">
          <RepoInput onConnect={handleImport} isLoading={false} />
        </div>

        {/* Repo List */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
           <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Available Repositories</h3>
           </div>
           {loading ? (
             <div className="p-24 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Fetching Repositories</p>
             </div>
           ) : repos.length === 0 ? (
             <div className="p-24 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-gray-700">
                  <Box className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No repositories found in your account.</p>
             </div>
           ) : (
             <ul className="divide-y divide-gray-100 dark:divide-gray-800">
               {repos.map(repo => (
                 <li key={repo.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <button 
                      onClick={() => handleImport(repo.html_url)}
                      className="w-full text-left p-6 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Github size={20} className="dark:text-white" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                             {repo.name}
                             {repo.language && (
                               <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500 font-bold uppercase tracking-tighter">
                                 {repo.language}
                               </span>
                             )}
                          </h4>
                          <p className="text-xs text-gray-400 font-medium truncate max-w-sm">{repo.full_name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                           <Shield size={12} className="text-blue-500" />
                           <span className="text-[10px] font-black text-gray-500 uppercase">Ready</span>
                        </div>
                        <div className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-xs font-black opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                           Import
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors" />
                      </div>
                    </button>
                 </li>
               ))}
             </ul>
           )}
        </div>
      </main>
    </div>
  );
}
