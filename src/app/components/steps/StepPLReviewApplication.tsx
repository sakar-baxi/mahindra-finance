"use client";

import React, { useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import StepCard from "@/app/components/layout/StepCard";
import { makeJourneyStepId } from "@/app/context/stepDefinitions";
import type { JourneyType } from "@/app/context/stepDefinitions";
import { Info } from "lucide-react";

/** Step 7: Review application with editable fields and Mahindra Finance T&C. */
export default function StepPLReviewApplication() {
  const { formData, nextStep, prevStep, journeySteps, currentStepIndex, goToStep } = useJourney();
  const [termsAccepted, setTermsAccepted] = useState(!!formData.termsAccepted);

  const total = journeySteps.length;
  const stepLabel = total ? `Step ${currentStepIndex + 1} of ${total}` : null;

  const reviewItems: { key: string; label: string; value: string }[] = [
    { key: "maritalStatus", label: "MARITAL STATUS", value: formData.maritalStatus || "—" },
    { key: "email", label: "EMAIL", value: formData.email || "—" },
    { key: "fatherName", label: "FATHER'S NAME", value: formData.fatherName || "—" },
    { key: "motherName", label: "MOTHER'S NAME", value: formData.motherName || "—" },
    { key: "incomeRange", label: "ANNUAL INCOME RANGE", value: formData.incomeRange || "—" },
    { key: "currentAddress", label: "ADDRESS", value: formData.currentAddress || formData.permanentAddress || "—" },
  ];

  const handleEdit = (key: string) => {
    if (key === "maritalStatus" || key === "email" || key === "fatherName" || key === "motherName") {
      const stepId = makeJourneyStepId("personal-loan" as JourneyType, "personalDetails");
      goToStep(stepId);
    } else if (key === "incomeRange" || key === "currentAddress") {
      const stepId = makeJourneyStepId("personal-loan" as JourneyType, "addressIncomeRegulatory");
      goToStep(stepId);
    }
  };

  const handleSubmit = () => {
    if (!termsAccepted) return;
    nextStep();
  };

  return (
    <StepCard maxWidth="2xl" step={stepLabel ?? undefined}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">STEP {currentStepIndex + 1} OF {total}</p>
      <h1 className="text-2xl font-bold text-slate-900">Review Your Application</h1>
      <p className="text-slate-600">Please verify all details before submitting.</p>

      <div className="space-y-4 mt-6">
        {reviewItems.map(({ key, label, value }) => (
          <div key={key} className="flex items-center justify-between gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
              <p className="font-semibold text-slate-900 mt-0.5">{value}</p>
            </div>
            <Button type="button" variant="ghost" size="sm" className="text-dashboard-primary shrink-0" onClick={() => handleEdit(key)}>
              Edit
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 mt-6">
        <Checkbox id="pl-terms" checked={termsAccepted} onCheckedChange={(c) => setTermsAccepted(!!c)} className="mt-0.5" />
        <label htmlFor="pl-terms" className="text-sm text-slate-700 leading-relaxed">
          I confirm that all information provided is accurate and I accept the Terms &amp; Conditions of <strong>Mahindra Finance</strong>.
        </label>
      </div>
      {!termsAccepted && (
        <p className="flex items-center gap-2 text-sm text-slate-500 mt-2">
          <Info className="w-4 h-4 shrink-0" /> Please accept the terms to submit
        </p>
      )}

      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={prevStep} className="border-slate-300">Back</Button>
        <Button type="button" onClick={handleSubmit} disabled={!termsAccepted} className="bg-dashboard-primary hover:bg-dashboard-primary-dark text-white">
          Submit
        </Button>
      </div>
    </StepCard>
  );
}
