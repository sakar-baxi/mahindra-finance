"use client";

import React, { useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/components/ui/label";
import StepCard from "@/app/components/layout/StepCard";
import { Upload, Home, FileCheck } from "lucide-react";

/** Step 8: Document collection – Documents NOT available in HRIS (no salary/income docs; property docs for LAP, etc.). */
export default function StepPLDocumentCollection() {
  const { updateFormData, nextStep, journeySteps, currentStepIndex } = useJourney();
  const [propertyDoc, setPropertyDoc] = useState<File | null>(null);
  const [otherDoc, setOtherDoc] = useState<File | null>(null);

  const total = journeySteps.length;
  const stepLabel = total ? `Step ${currentStepIndex + 1} of ${total}` : null;

  const handleNext = () => {
    updateFormData({
      propertyDocumentUploaded: !!propertyDoc,
      otherNonHrisDocumentUploaded: !!otherDoc,
    });
    nextStep();
  };

  return (
    <StepCard maxWidth="2xl" step={stepLabel ?? undefined}>
      <h1 className="text-2xl font-bold text-slate-900">Document Collection</h1>
      <p className="text-slate-600 mt-1">Upload documents that are not available in HRIS. Salary and income details are already taken from your HRIS record.</p>
      <div className="mt-3 px-4 py-2 rounded-lg bg-slate-100 border border-slate-200">
        <p className="text-sm text-slate-700">Do not upload salary slips, Form 16, or income proof—these are pre-available from HRIS.</p>
      </div>

      <div className="space-y-6 mt-6">
        <div>
          <Label className="flex items-center gap-2 text-slate-700">
            <Home className="w-4 h-4" /> Property document (for Loan against Property) *
          </Label>
          <p className="text-xs text-slate-500 mt-0.5">Title deed, property papers, or encumbrance certificate (PDF or image, max 5MB). Required for Loan against Property; optional for other products.</p>
          <div className="mt-2 border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              id="property-doc"
              onChange={(e) => setPropertyDoc(e.target.files?.[0] ?? null)}
            />
            <label htmlFor="property-doc" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-slate-400" />
              <span className="text-sm text-slate-600">{propertyDoc ? propertyDoc.name : "Choose file"}</span>
            </label>
          </div>
        </div>

        <div>
          <Label className="flex items-center gap-2 text-slate-700">
            <FileCheck className="w-4 h-4" /> Other document not in HRIS *
          </Label>
          <p className="text-xs text-slate-500 mt-0.5">NOC, undertaking, consent letter, or any document not already available in HRIS (PDF or image, max 5MB).</p>
          <div className="mt-2 border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              id="other-doc"
              onChange={(e) => setOtherDoc(e.target.files?.[0] ?? null)}
            />
            <label htmlFor="other-doc" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-slate-400" />
              <span className="text-sm text-slate-600">{otherDoc ? otherDoc.name : "Choose file"}</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          type="button"
          onClick={handleNext}
          disabled={!otherDoc}
          className="bg-dashboard-primary hover:bg-dashboard-primary-dark text-white"
        >
          Continue
        </Button>
      </div>
    </StepCard>
  );
}
