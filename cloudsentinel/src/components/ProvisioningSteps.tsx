"use client";

import React from "react";
import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";

export type StepState = "pending" | "active" | "complete" | "error";

export interface ProvisioningStep {
  id: string;
  label: string;
  description: string;
  state: StepState;
  errorReason?: string;
}

interface ProvisioningStepsProps {
  steps: ProvisioningStep[];
}

export default function ProvisioningSteps({ steps }: ProvisioningStepsProps) {
  return (
    <div className="w-full max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700/50 p-8 pt-10 pb-10">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
        Provisioning Identity
      </h3>
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.2rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-gray-700 before:to-transparent">
        {steps.map((step, index) => {
          const isError = step.state === "error";
          const isActive = step.state === "active";
          const isComplete = step.state === "complete";

          return (
            <div key={step.id} className="relative flex items-start gap-4 z-10">
              <div className="flex-shrink-0 mt-1">
                {isComplete ? (
                  <CheckCircle2 className="w-8 h-8 text-green-500 animate-in zoom-in" />
                ) : isError ? (
                  <XCircle className="w-8 h-8 text-red-500" />
                ) : isActive ? (
                  <div className="relative">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin absolute" />
                  </div>
                ) : (
                  <Circle className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-base font-medium ${
                    isError
                      ? "text-red-500"
                      : isActive || isComplete
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {step.label}
                </p>
                {(isActive || isError) && (
                  <p
                    className={`mt-1 text-sm animate-in slide-in-from-top-1 fade-in ${
                      isError ? "text-red-400" : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {isError && step.errorReason ? step.errorReason : step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
