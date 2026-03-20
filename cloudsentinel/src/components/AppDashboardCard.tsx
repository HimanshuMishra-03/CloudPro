"use client";

import React, { useState } from "react";
import { Github, Key, Shield, ShieldCheck, TerminalSquare } from "lucide-react";
import Link from "next/link";

interface AppDashboardCardProps {
  appId: string;
  spiffeId: string;
  vaultKeyName: string;
  stack: "nodejs" | "python" | "go" | "other" | string;
}

export default function AppDashboardCard({
  appId,
  spiffeId,
  vaultKeyName,
  stack,
}: AppDashboardCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(spiffeId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stackColors: Record<string, string> = {
    nodejs: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    python: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    go: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
    other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden animate-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="p-8 pb-6 border-b border-gray-100 dark:border-gray-700/50 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-2xl">
              <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {appId.split("/")[1]}
              </h2>
              <a
                href={`https://github.com/${appId}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors mt-1"
              >
                <Github className="w-4 h-4" />
                {appId}
              </a>
            </div>
          </div>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
              stackColors[stack] || stackColors["other"]
            }`}
          >
            {stack}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-8 space-y-6">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Zero-Trust Identity (SPIFFE ID)
          </label>
          <div className="flex items-center">
            <code className="flex-1 block p-3 bg-gray-50 dark:bg-gray-900 rounded-l-xl text-sm text-gray-800 dark:text-gray-300 font-mono break-all border border-gray-200 dark:border-gray-700 border-r-0">
              {spiffeId}
            </code>
            <button
              onClick={handleCopy}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 hover:dark:bg-gray-600 border border-gray-200 dark:border-gray-700 rounded-r-xl transition-colors font-medium text-sm text-gray-700 dark:text-gray-300"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
              <Key className="w-4 h-4" />
              <span className="text-sm font-medium">Vault Root KEK</span>
            </div>
            <p className="font-mono text-sm text-gray-800 dark:text-gray-200 truncate" title={vaultKeyName}>
              transit/keys/{vaultKeyName}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
              Active • Rotates in 30d
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
             <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
              <TerminalSquare className="w-4 h-4" />
              <span className="text-sm font-medium">Policy Audit</span>
            </div>
            <p className="text-sm text-gray-800 dark:text-gray-200">
              OPA Registration OK
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium break-words trunkate">
              Topic: audit-log #APP_REGISTERED
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700/50 flex justify-end">
        <Link
          href={`/dashboard/${appId}`}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 inline-block"
        >
          Run First Chaos Experiment
        </Link>
      </div>
    </div>
  );
}
