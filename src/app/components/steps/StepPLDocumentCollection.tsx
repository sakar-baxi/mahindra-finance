"use client";

import React, { useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/components/ui/label";
import StepCard from "@/app/components/layout/StepCard";
import { FileText, Upload } from "lucide-react";

/** Step 8: Document collection – Income document & Bank statement (replaces Video KYC). */
export default function StepPLDocumentCollection() {
  const { formData, updateFormData, nextStep, journeySteps, currentStepIndex } = useJourney();
  const [incomeDoc, setIncomeDoc] = useState<File | null>(null);
  const [bankStatementDoc, setBankStatementDoc] = useState<File | null>(null);

  const total = journeySteps.length;
  const stepLabel = total ? `Step ${currentStepIndex + 1} of ${total}` : null;

  const handleNext = () => {
    updateFormData({
      incomeDocumentUploaded: !!incomeDoc,
      bankStatementUploaded: !!bankStatementDoc,
    });
    nextStep();
  };

  return (
    <StepCard maxWidth="2xl" step={stepLabel ?? undefined}>
      <h1 className="text-2xl font-bold text-slate-900">Document Collection</h1>
      <p className="text-slate-600 mt-1">Upload income proof and bank statement for verification.</p>

      <div className="space-y-6 mt-6">
        <div>
          <Label className="flex items-center gap-2 text-slate-700">
            <FileText className="w-4 h-4" /> Income Document *
          </Label>
          <p className="text-xs text-slate-500 mt-0.5">Salary slip / Form 16 / ITR (PDF or image, max 5MB)</p>
          <div className="mt-2 border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              id="income-doc"
              onChange={(e) => setIncomeDoc(e.target.files?.[0] ?? null)}
            />
            <label htmlFor="income-doc" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-slate-400" />
              <span className="text-sm text-slate-600">{incomeDoc ? incomeDoc.name : "Choose file"}</span>
            </label>
          </div>
        </div>

        <div>
          <Label className="flex items-center gap-2 text-slate-700">
            <FileText className="w-4 h-4" /> Bank Statement *
          </Label>
          <p className="text-xs text-slate-500 mt-0.5">Last 3–6 months (PDF or image, max 5MB)</p>
          <div className="mt-2 border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              id="bank-statement"
              onChange={(e) => setBankStatementDoc(e.target.files?.[0] ?? null)}
            />
            <label htmlFor="bank-statement" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-slate-400" />
              <span className="text-sm text-slate-600">{bankStatementDoc ? bankStatementDoc.name : "Choose file"}</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          type="button"
          onClick={handleNext}
          disabled={!incomeDoc || !bankStatementDoc}
          className="bg-dashboard-primary hover:bg-dashboard-primary-dark text-white"
        >
          Continue
        </Button>
      </div>
    </StepCard>
  );
}
