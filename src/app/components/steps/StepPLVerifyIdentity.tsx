"use client";

import React, { useState, useEffect } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StepCard from "@/app/components/layout/StepCard";
import { Phone, Calendar, FileText, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { isValidIndianPan } from "@/lib/panUtils";

/** Step 1 of MMFSL PL journey: Verify Identity – Mobile, DOB, PAN (prefilled from HRIS when available). */
export default function StepPLVerifyIdentity() {
  const { formData, updateFormData, nextStep, journeySteps, currentStepIndex } = useJourney();
  const [mobileNumber, setMobileNumber] = useState(formData.mobileNumber || formData.phone || "");
  const [dob, setDob] = useState(formData.dob || "");
  const [pan, setPan] = useState(formData.pan || "");
  const fromHris = !!(formData.pan && formData.dob);

  useEffect(() => {
    if (formData.mobileNumber) setMobileNumber(String(formData.mobileNumber));
    if (formData.phone) setMobileNumber(String(formData.phone));
    if (formData.dob) setDob(String(formData.dob));
    if (formData.pan) setPan(String(formData.pan));
  }, [formData.mobileNumber, formData.phone, formData.dob, formData.pan]);

  const formatDob = (v: string) => {
    const d = v.replace(/\D/g, "");
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4, 8)}`;
  };

  const handleRequestOtp = () => {
    updateFormData({ mobileNumber: mobileNumber.replace(/\D/g, "").slice(-10), phone: mobileNumber, dob, pan });
    nextStep();
  };

  const total = journeySteps.length;
  const stepLabel = total ? `Step ${currentStepIndex + 1} of ${total}` : null;
  const mobileValid = /^[6-9]\d{9}$/.test(mobileNumber.replace(/\D/g, ""));
  const dobValid = (dob || "").replace(/\D/g, "").length >= 8;
  const panTrimmed = (pan || "").toUpperCase().trim().slice(0, 10);
  const panValid = isValidIndianPan(panTrimmed);
  const canProceed = mobileValid && dobValid && panValid;

  return (
    <StepCard maxWidth="2xl" step={stepLabel ?? undefined}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">STEP 1 OF {total}</p>
      <h1 className="text-2xl font-bold text-slate-900">Verify Your Identity</h1>
      <p className="text-slate-600">Please provide your details to begin your account setup.</p>

      <div className="space-y-5">
        <div>
          <Label className="flex items-center gap-2 text-slate-700">
            <Phone className="w-4 h-4" /> Mobile Number *
          </Label>
          <div className="mt-1.5 flex rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
            <span className="flex items-center px-3 border-r border-slate-200 bg-white text-slate-600">+91</span>
            <Input
              type="tel"
              placeholder="9876543210"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className="border-0 bg-transparent"
            />
          </div>
        </div>
        <div>
          <Label className="flex items-center gap-2 text-slate-700">
            <Calendar className="w-4 h-4" /> Date of Birth *
          </Label>
          <Input
            type="text"
            placeholder="DD/MM/YYYY"
            value={dob}
            onChange={(e) => setDob(formatDob(e.target.value))}
            className="mt-1.5 h-11 bg-slate-50 border-slate-200"
            readOnly={fromHris}
          />
        </div>
        <div>
          <Label className="flex items-center gap-2 text-slate-700">
            <FileText className="w-4 h-4" /> PAN Number *
          </Label>
          <Input
            type="text"
            placeholder="ABCDE1234F"
            value={pan}
            onChange={(e) => {
              const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
              setPan(v);
            }}
            className={cn("mt-1.5 h-11 bg-slate-50 border-slate-200", fromHris && "opacity-80")}
            readOnly={fromHris}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="button" onClick={handleRequestOtp} disabled={!canProceed} className="bg-dashboard-primary hover:bg-dashboard-primary-dark text-white">
          Request OTP <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </StepCard>
  );
}
