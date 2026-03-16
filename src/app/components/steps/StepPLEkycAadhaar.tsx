"use client";

import React, { useState, useEffect } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import StepCard from "@/app/components/layout/StepCard";
import { Shield, ArrowRight } from "lucide-react";

/** Step 3: Aadhaar e-KYC – Aadhaar number + consent (Mahindra, not Bank). */
export default function StepPLEkycAadhaar() {
  const { formData, updateFormData, nextStep, journeySteps, currentStepIndex } = useJourney();
  const [aadhaarNumber, setAadhaarNumber] = useState(formData.aadhaarNumber || "");
  const [consent, setConsent] = useState(!!formData.ekycUidaiConsent);

  useEffect(() => {
    if (formData.aadhaarNumber) setAadhaarNumber(String(formData.aadhaarNumber));
  }, [formData.aadhaarNumber]);

  const total = journeySteps.length;
  const stepLabel = total ? `Step ${currentStepIndex + 1} of ${total}` : null;
  const aadhaarValid = aadhaarNumber.replace(/\D/g, "").length === 12;

  const handleNext = () => {
    updateFormData({ aadhaarNumber: aadhaarNumber.replace(/\D/g, ""), ekycUidaiConsent: consent });
    nextStep();
  };

  const formatAadhaar = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 12);
    return d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  return (
    <StepCard maxWidth="2xl" step={stepLabel ?? undefined}>
      <h1 className="text-2xl font-bold text-slate-900">Aadhaar e-KYC</h1>
      <p className="text-slate-600 mt-1">Instant identity verification using UIDAI ecosystem.</p>

      <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 flex items-start gap-3">
        <Shield className="w-5 h-5 text-dashboard-primary shrink-0 mt-0.5" />
        <p className="text-sm text-slate-700">
          <strong>Secure Verification.</strong> Your Aadhaar data is encrypted and used only for identity validation as per RBI guidelines.
        </p>
      </div>

      <div>
        <Label className="text-slate-700">Aadhaar Number *</Label>
        <Input
          type="text"
          placeholder="0000 0000 0000"
          value={formatAadhaar(aadhaarNumber)}
          onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
          className="mt-1.5 h-11 border-slate-200"
          maxLength={14}
        />
      </div>

      <div className="flex items-start gap-3">
        <Checkbox id="uidai-consent" checked={consent} onCheckedChange={(c) => setConsent(!!c)} className="mt-0.5" />
        <label htmlFor="uidai-consent" className="text-sm text-slate-700 leading-relaxed">
          I voluntarily authorize <strong>Mahindra Finance</strong> to use my Aadhaar details for eKYC authentication and to fetch my KYC details from UIDAI for account opening. I indemnify <strong>Mahindra Finance</strong> against losses arising due to any difference in my name on Aadhaar and PAN, if any.
        </label>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="button" onClick={handleNext} disabled={!aadhaarValid || !consent} className="bg-dashboard-primary hover:bg-dashboard-primary-dark text-white">
          Get OTP <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </StepCard>
  );
}
