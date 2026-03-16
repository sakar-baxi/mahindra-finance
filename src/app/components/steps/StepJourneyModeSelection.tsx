"use client";

import React from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { useJourneyConfig } from "@/app/context/JourneyConfigContext";
import { MessageCircle, FileText, Zap, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StepJourneyModeSelection() {
  const { selectJourneyMode } = useJourney();
  const { config } = useJourneyConfig();
  const bankName = config.bankName || "your bank";

  const handleSelectConversational = () => selectJourneyMode("conversational");
  const handleSelectForm = () => selectJourneyMode("form");

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          How would you like to open your account?
        </h1>
        <p className="text-slate-600">
          Choose the experience that works best for you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <button
          type="button"
          onClick={handleSelectConversational}
          className={cn(
            "group relative p-6 rounded-2xl border-2 text-left transition-all duration-200",
            "bg-white border-slate-200 hover:border-[var(--primary-bank)] hover:shadow-lg hover:shadow-slate-200/50",
            "focus:outline-none focus:ring-2 focus:ring-[var(--primary-bank)] focus:ring-offset-2"
          )}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ backgroundColor: "rgba(var(--primary-bank-rgb, 0, 76, 143), 0.1)" }}
          >
            <MessageCircle className="w-6 h-6" style={{ color: "var(--primary-bank)" }} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Conversational</h2>
          <p className="text-sm text-slate-600 mb-4">
            Chat with our AI assistant. Quick & smart—we&apos;ll fetch your details from HRMS or {bankName} APIs. 
            Just confirm and you&apos;re done.
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: "var(--primary-bank)" }}>
            <Zap className="w-4 h-4" />
            Fastest • AI-powered • Data pre-filled
          </div>
        </button>

        <button
          type="button"
          onClick={handleSelectForm}
          className={cn(
            "group relative p-6 rounded-2xl border-2 text-left transition-all duration-200",
            "bg-white border-slate-200 hover:border-[var(--primary-bank)] hover:shadow-lg hover:shadow-slate-200/50",
            "focus:outline-none focus:ring-2 focus:ring-[var(--primary-bank)] focus:ring-offset-2"
          )}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ backgroundColor: "rgba(var(--primary-bank-rgb, 0, 76, 143), 0.1)" }}
          >
            <FileText className="w-6 h-6" style={{ color: "var(--primary-bank)" }} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Form-based</h2>
          <p className="text-sm text-slate-600 mb-4">
            Traditional step-by-step flow. Fill forms at your own pace. Best if you prefer 
            a structured, guided experience.
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: "var(--primary-bank)" }}>
            <RefreshCw className="w-4 h-4" />
            Guided • Step-by-step • Full control
          </div>
        </button>
      </div>
    </div>
  );
}
