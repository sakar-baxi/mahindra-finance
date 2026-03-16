"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { useJourneyConfig } from "@/app/context/JourneyConfigContext";
import { makeJourneyStepId } from "@/app/context/stepDefinitions";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck } from "lucide-react";
import StepCard from "@/app/components/layout/StepCard";

export default function StepEtbIncomeDeclarations() {
  const { updateFormData, formData, journeySteps, currentStepIndex, setBottomBarContent, goToStep, journeyType } = useJourney();
  const { config: journeyConfig } = useJourneyConfig();
  const [incomeRange, setIncomeRange] = useState(formData.incomeRange || "");
  const [occupation, setOccupation] = useState(formData.occupation || "");
  const [sourceOfIncome, setSourceOfIncome] = useState(formData.sourceOfIncome || "");
  const [grossAnnualIncome, setGrossAnnualIncome] = useState(formData.grossAnnualIncome || formData.income || "");
  const [isPep, setIsPep] = useState<boolean>(!!formData.isPep);
  const [isIndianNational, setIsIndianNational] = useState<boolean>(formData.isIndianNational !== false);
  const [isTaxResidentIndiaOnly, setIsTaxResidentIndiaOnly] = useState<boolean>(formData.isTaxResidentIndiaOnly !== false);

  const stepLabel = useMemo(() => {
    const total = journeySteps.length || 0;
    if (!total) return undefined;
    return `Step ${currentStepIndex + 1} of ${total}`;
  }, [journeySteps.length, currentStepIndex]);

  const hasExtendedFields = journeyConfig.stepFieldLayouts?.etbIncomeDeclarations?.some((f) =>
    ["occupation", "sourceOfIncome", "grossAnnualIncome"].includes(f.id)
  );

  const incomeRanges = journeyConfig.fieldOptions.incomeRange;

  const isValid = incomeRange && (!hasExtendedFields || (occupation && sourceOfIncome && grossAnnualIncome));

  useEffect(() => {
    setBottomBarContent(
      <div className="w-full flex justify-end">
        <Button
          type="button"
          onClick={() => {
            updateFormData({
              incomeRange,
              occupation,
              sourceOfIncome,
              grossAnnualIncome,
              isPep,
              isIndianNational,
              isTaxResidentIndiaOnly,
            });
            const targetJourney = journeyType || "etb";
            goToStep(makeJourneyStepId(targetJourney, "conversionVerification"));
          }}
          disabled={!isValid}
          className="btn-primary w-full md:w-[360px]"
        >
          {journeyConfig.ctaLabels.continue}
        </Button>
      </div>
    );
  }, [goToStep, incomeRange, occupation, sourceOfIncome, grossAnnualIncome, isIndianNational, isPep, isTaxResidentIndiaOnly, journeyType, setBottomBarContent, updateFormData, journeyConfig.ctaLabels.continue, hasExtendedFields]);

  return (
    <StepCard step={stepLabel} maxWidth="6xl">
      <div className="page-header mb-6">
        <h1 className="page-title text-2xl md:text-3xl">Income & Declarations</h1>
        <p className="page-subtitle text-slate-600 mt-1">Select income range and confirm declarations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-5">
        {hasExtendedFields && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Occupation</label>
              <Select value={occupation} onValueChange={setOccupation}>
                <SelectTrigger className="enterprise-input">
                  <SelectValue placeholder="Select occupation" />
                </SelectTrigger>
                <SelectContent className="rounded-[var(--radius-lg)]">
                  {(journeyConfig.fieldOptions.occupation ?? []).map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="form-label">Source of income</label>
              <Select value={sourceOfIncome} onValueChange={setSourceOfIncome}>
                <SelectTrigger className="enterprise-input">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent className="rounded-[var(--radius-lg)]">
                  {(journeyConfig.fieldOptions.sourceOfIncome ?? []).map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Gross annual income in Rupees (₹)</label>
              <Input
                type="text"
                inputMode="numeric"
                value={grossAnnualIncome}
                onChange={(e) => setGrossAnnualIncome(e.target.value.replace(/\D/g, ""))}
                className="enterprise-input"
                placeholder="0"
              />
            </div>
          </div>
        )}
        <div>
          <label className="form-label">Annual Income Range</label>
          <Select value={incomeRange} onValueChange={setIncomeRange}>
            <SelectTrigger className="enterprise-input flex items-center justify-between">
              <SelectValue placeholder="Select income range" />
            </SelectTrigger>
            <SelectContent className="rounded-[var(--radius-lg)] border-slate-200 shadow-xl p-2 bg-white">
              {incomeRanges.map((r) => (
                <SelectItem key={r.value} value={r.value} className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-5 space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              Regulatory Declarations
            </p>
            <p className="text-xs text-gray-600 mt-1">As per RBI/Compliance requirements, please confirm the below.</p>
          </div>

          <div className="space-y-3">
            {[
              { label: "Are you a Politically Exposed Person (PEP)?", value: isPep, setValue: setIsPep, key: "isPep" },
              { label: "Are you an Indian national?", value: isIndianNational, setValue: setIsIndianNational, key: "isIndianNational" },
              { label: "Are you a Tax Resident of India only?", value: isTaxResidentIndiaOnly, setValue: setIsTaxResidentIndiaOnly, key: "isTaxResidentIndiaOnly" },
            ].map((q) => (
              <div key={q.key} className="flex items-center justify-between gap-4">
                <p className="text-sm text-gray-800">{q.label}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => q.setValue(false)}
                    className={[
                      "h-8 px-3 rounded-[999px] text-xs font-semibold border transition-colors",
                      q.value === false ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => q.setValue(true)}
                    className={[
                      "h-8 px-3 rounded-[999px] text-xs font-semibold border transition-colors",
                      q.value === true ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    Yes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StepCard>
  );
}
