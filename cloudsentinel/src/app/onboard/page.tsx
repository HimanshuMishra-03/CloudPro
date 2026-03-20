"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, ArrowLeft, Github, Search, Plus, ListFilter, ChevronRight } from "lucide-react";
import RepoInput from "@/components/RepoInput";
import ProvisioningSteps, { ProvisioningStep, StepState } from "@/components/ProvisioningSteps";
import AppDashboardCard from "@/components/AppDashboardCard";

type UIState = "IDLE" | "PROVISIONING" | "SUCCESS" | "ERROR";

const initialSteps: ProvisioningStep[] = [
  { id: "repo", label: "Verifying repository", description: "Checking GitHub access and tech stack...", state: "pending" },
  { id: "spiffe", label: "Issuing cryptographic identity", description: "Issuing SPIFFE x509-SVID...", state: "pending" },
  { id: "opa", label: "Evaluating access policy", description: "Running OPA registration rules...", state: "pending" },
  { id: "vault", label: "Generating encryption key", description: "Creating Vault Transit KEK...", state: "pending" },
];

export default function OnboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [uiState, setUiState] = useState<UIState>("IDLE");
  const [steps, setSteps] = useState<ProvisioningStep[]>(initialSteps);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [appDetails, setAppDetails] = useState<any>(null);

  useEffect(() => {
    const repo = searchParams.get("repo");
    if (repo) {
      handleOnboard(repo);
    }
  }, [searchParams]);

  const updateStep = (id: string, state: StepState, errorReason?: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, state, errorReason } : s))
    );
  };

  const handleOnboard = async (repoUrl: string) => {
    setUiState("PROVISIONING");
    setErrorMsg(null);
    setSteps(initialSteps.map(s => ({ ...s, state: "pending" })));

    try {
      updateStep("repo", "active");
      
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          repo_url: repoUrl, 
          user_id: "usr_abc123" 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          // It's already registered, just treat it as success!
          updateStep("repo", "complete");
          updateStep("spiffe", "complete");
          updateStep("opa", "complete");
          updateStep("vault", "complete");
          setAppDetails({
            app_id: repoUrl.split("/").slice(-2).join("/"),
            spiffe_id: `spiffe://cloudsentinel.io/app/${repoUrl.split("/").slice(-2).join("/")}`,
            vault_key_name: repoUrl.split("/").slice(-2).join("-"),
            status: "ACTIVE"
          });
          setUiState("SUCCESS");
          setTimeout(() => router.push("/dashboard"), 3000);
          return;
        }

        const errorCode = data.error_code;
        if (errorCode === "REPO_NOT_FOUND" || errorCode === "INVALID_REPO_URL") {
          updateStep("repo", "error", data.message);
        } else if (errorCode === "OPA_POLICY_DENIED") {
          updateStep("repo", "complete");
          updateStep("spiffe", "complete");
          updateStep("opa", "error", data.reason || "Policy Denied");
        } else if (errorCode === "VAULT_UNAVAILABLE") {
          updateStep("repo", "complete");
          updateStep("spiffe", "complete");
          updateStep("opa", "complete");
          updateStep("vault", "error", "Vault connection failed");
        } else {
          setErrorMsg(data.message || "Registration failed");
        }
        setUiState("ERROR");
        return;
      }

      // UX simulation
      updateStep("repo", "complete");
      await new Promise(r => setTimeout(r, 400));
      updateStep("spiffe", "complete");
      await new Promise(r => setTimeout(r, 400));
      updateStep("opa", "complete");
      await new Promise(r => setTimeout(r, 400));
      updateStep("vault", "complete");
      await new Promise(r => setTimeout(r, 600));

      setAppDetails(data);
      setUiState("SUCCESS");

      // Auto redirect to dashboard after a delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);

    } catch (e: any) {
      console.error("Onboarding error:", e);
      setUiState("ERROR");
      setErrorMsg("Network error: Could not reach the registration API");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-gray-950 font-sans">
      {/* Header */}
      <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="bg-black dark:bg-white p-1.5 rounded-md">
             <Shield className="h-4 w-4 text-white dark:text-black" />
          </div>
          <span className="font-bold text-sm tracking-tight">CloudSentinel</span>
        </Link>
        <div className="flex items-center gap-4">
           <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <button 
          onClick={() => {
            if (uiState === "PROVISIONING" || uiState === "SUCCESS") {
              setUiState("IDLE");
              setSteps(initialSteps.map(s => ({ ...s, state: "pending" })));
            }
            router.push("/dashboard/import");
          }}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Import
        </button>

        {uiState === "IDLE" || uiState === "ERROR" ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight dark:text-white">Import Repository</h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Connect your GitHub project to enable Zero-Trust identity and encryption.</p>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
              <RepoInput onConnect={handleOnboard} isLoading={false} />
              
              {uiState === "ERROR" && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                  <span className="text-sm font-bold">Error: {errorMsg}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
               <FeatureCard 
                title="Automated SPIRE Registration" 
                desc="Workloads are automatically registered with a persistent SPIFFE ID."
               />
               <FeatureCard 
                title="Vault KEK Generation" 
                desc="A dedicated Transit key is provisioned for client-side privacy."
               />
            </div>
          </div>
        ) : uiState === "PROVISIONING" ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-12 shadow-2xl animate-in zoom-in-95 duration-500 flex flex-col items-center">
            <ProvisioningSteps steps={steps} />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-700 flex flex-col items-center py-12">
            <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-green-500/20">
               <Shield size={40} />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black dark:text-white">Project Connected</h2>
              <p className="text-gray-500 dark:text-gray-400">Redirecting you to your dashboard summary...</p>
            </div>
            {appDetails && (
              <AppDashboardCard
                appId={appDetails.app_id}
                spiffeId={appDetails.spiffe_id}
                vaultKeyName={appDetails.vault_key_name}
                stack={appDetails.stack}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
      <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
        <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
        {title}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
