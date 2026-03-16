"use client";

import React from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import StepCard from "@/app/components/layout/StepCard";
import { Shield, CheckCircle2 } from "lucide-react";

/** Step 9: Mock bureau response and credit/underwriting – then proceed to complete. */
export default function StepPLBureauResponse() {
  const { nextStep, journeySteps, currentStepIndex } = useJourney();

  const total = journeySteps.length;
  const stepLabel = total ? `Step ${currentStepIndex + 1} of ${total}` : null;

  // Mock bureau + underwriting outcome (credit rules × underwriting)
  const creditScore = 762;
  const riskBand = "Prime";
  const eligibility = "Eligible";
  const maxLoanAmount = "₹8,00,000";

  return (
    <StepCard maxWidth="2xl" step={stepLabel ?? undefined}>
      <h1 className="text-2xl font-bold text-slate-900">Bureau & Underwriting</h1>
      <p className="text-slate-600 mt-1">Credit check and underwriting complete.</p>

      <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 flex items-start gap-3 mt-4">
        <Shield className="w-5 h-5 text-dashboard-primary shrink-0 mt-0.5" />
        <p className="text-sm text-slate-700">
          Your application has been verified against bureau data and internal underwriting rules.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-xs font-semibold uppercase text-slate-500">Credit Score</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{creditScore}</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-xs font-semibold uppercase text-slate-500">Risk Band</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{riskBand}</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-xs font-semibold uppercase text-slate-500">Eligibility</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{eligibility}</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-xs font-semibold uppercase text-slate-500">Max Loan (indicative)</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{maxLoanAmount}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
        <p className="text-sm text-slate-700">
          Bureau response and underwriting rules have been applied. You can proceed to complete your application.
        </p>
      </div>

      <div className="flex justify-end pt-6">
        <Button type="button" onClick={nextStep} className="bg-dashboard-primary hover:bg-dashboard-primary-dark text-white">
          Complete Application
        </Button>
      </div>
    </StepCard>
  );
}
