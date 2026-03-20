"use client";

import React, { useState, useEffect } from "react";
import { Search, Github, Globe, Lock, Loader2, Check, ChevronDown, ListFilter } from "lucide-react";

interface Repo {
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  language: string;
  private: boolean;
}

interface RepoInputProps {
  onConnect: (url: string) => void;
  isLoading: boolean;
}

const RepoInput: React.FC<RepoInputProps> = ({ onConnect, isLoading }) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [showAccountRepos, setShowAccountRepos] = useState(false);
  const [myRepos, setMyRepos] = useState<Repo[]>([]);
  const [isFetchingRepos, setIsFetchingRepos] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const validateUrl = (value: string) => {
    const githubRegex = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/;
    if (!value) return "Repository URL is required";
    if (!githubRegex.test(value)) return "Please enter a valid GitHub repository URL (e.g., https://github.com/user/repo)";
    return "";
  };

  const handleConnect = (e?: React.FormEvent) => {
    e?.preventDefault();
    const validationError = validateUrl(url);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    onConnect(url);
  };

  const fetchMyRepos = async () => {
    setIsFetchingRepos(true);
    setFetchError("");
    try {
      const res = await fetch("/api/github/repos");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch repos");
      }
      const data = await res.json();
      setMyRepos(data);
      setShowAccountRepos(true);
    } catch (err: any) {
      setFetchError(err.message);
    } finally {
      setIsFetchingRepos(false);
    }
  };

  const selectRepo = (repoUrl: string) => {
    setUrl(repoUrl);
    setShowAccountRepos(false);
    setError("");
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Github className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            className={`w-full bg-white dark:bg-gray-900 border-2 ${
              error ? "border-red-500 shadow-red-500/10" : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
            } rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-xl shadow-gray-200/50 dark:shadow-none placeholder:text-gray-400`}
            placeholder="https://github.com/username/repository"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(validateUrl(e.target.value));
            }}
            disabled={isLoading}
          />
           {error && (
            <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1.5 ml-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
              {error}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
           <button
            onClick={() => handleConnect()}
            disabled={isLoading}
            className="px-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-800 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-2 whitespace-nowrap min-w-[140px] justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect"
            )}
          </button>
          
          <button
            onClick={fetchMyRepos}
            disabled={isLoading || isFetchingRepos}
            className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95 group relative"
            title="Fetch repositories from your GitHub account"
          >
            {isFetchingRepos ? <Loader2 className="h-5 w-5 animate-spin" /> : <ListFilter className="h-5 w-5 group-hover:rotate-12 transition-transform" />}
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
          {fetchError === "No GitHub token configured in .env" ? (
            <span>Please add your <strong>GITHUB_TOKEN</strong> to the `.env` file to fetch repositories.</span>
          ) : (
            <span>{fetchError}</span>
          )}
        </div>
      )}

      {showAccountRepos && myRepos.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Select a Repository</span>
            <button onClick={() => setShowAccountRepos(false)} className="text-xs font-bold text-blue-600">Close</button>
          </div>
          <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
            {myRepos.map((repo) => (
              <button
                key={repo.full_name}
                onClick={() => selectRepo(repo.html_url)}
                className="w-full p-4 flex items-center justify-between hover:bg-blue-50/50 dark:hover:bg-blue-900/10 text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <Github className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{repo.name}</h4>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{repo.description || "No description"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {repo.private ? (
                    <span className="px-2 py-0.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 text-[10px] font-black uppercase rounded-md border border-yellow-100 dark:border-yellow-900/30">Private</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] font-black uppercase rounded-md border border-green-100 dark:border-green-900/30">Public</span>
                  )}
                  <ChevronDown className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors -rotate-90" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Helper text */}
      <div className="flex items-center justify-center gap-6 pt-2">
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          <Globe className="h-3 w-3" />
          Public Repositories
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          <Lock className="h-3 w-3" />
          Private Repositories
        </div>
      </div>
    </div>
  );
};

export default RepoInput;
