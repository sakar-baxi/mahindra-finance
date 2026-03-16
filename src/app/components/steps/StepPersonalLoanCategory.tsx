"use client";

import React from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import StepCard from "@/app/components/layout/StepCard";
import { FileText, TrendingUp } from "lucide-react";

export default function StepPersonalLoanCategory() {
  const { nextStep, updateFormData } = useJourney();

  const handleSelect = (category: "loans" | "investments") => {
    updateFormData({ personalLoanCategory: category });
    nextStep();
  };

  return (
    <StepCard maxWidth="2xl">
      <p className="text-sm font-medium text-slate-500 mb-1">Step 1 out of 4</p>
      <h1 className="text-2xl font-bold text-[#111827] mb-2">Select Category</h1>
      <p className="text-slate-600 mb-8">Choose what you would like to apply for</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <button
          type="button"
          onClick={() => handleSelect("loans")}
          className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-slate-200 hover:border-[var(--primary-bank)] hover:bg-[var(--primary-bank)]/5 transition-all text-left"
        >
          <div className="w-14 h-14 rounded-xl bg-[var(--primary-bank)]/10 flex items-center justify-center mb-4">
            <FileText className="w-7 h-7 text-[var(--primary-bank)]" />
          </div>
          <span className="text-lg font-semibold text-[#111827]">Loans</span>
          <span className="text-sm text-slate-500 mt-1">Personal Loan, Vehicle Loan & more</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelect("investments")}
          className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-slate-200 hover:border-[var(--primary-bank)] hover:bg-[var(--primary-bank)]/5 transition-all text-left"
        >
          <div className="w-14 h-14 rounded-xl bg-[var(--primary-bank)]/10 flex items-center justify-center mb-4">
            <TrendingUp className="w-7 h-7 text-[var(--primary-bank)]" />
          </div>
          <span className="text-lg font-semibold text-[#111827]">Investments</span>
          <span className="text-sm text-slate-500 mt-1">Fixed Deposits, Mutual Funds & more</span>
        </button>
      </div>

      <div className="mt-10 flex justify-center">
        <Button
          size="lg"
          className="bg-[var(--primary-bank)] hover:opacity-90 text-white px-8"
          disabled
        >
          NEXT
        </Button>
      </div>
    </StepCard>
  );
}
