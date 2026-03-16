"use client";

import React, { useState, useEffect } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StepCard from "@/app/components/layout/StepCard";
import { Shield } from "lucide-react";

/** Step 4: Aadhaar OTP – Single 6-digit input, Edit Aadhaar, Resend, Complete Verification. */
export default function StepPLEkycAadhaarOtp() {
  const { formData, nextStep, journeySteps, currentStepIndex, goToStep } = useJourney();
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(23);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  const total = journeySteps.length;
  const stepLabel = total ? `Step ${currentStepIndex + 1} of ${total}` : null;
  const otpDigits = otp.replace(/\D/g, "").slice(0, 6);
  const isOtpComplete = otpDigits.length === 6;

  const aadhaarLast4 = formData.aadhaarNumber ? String(formData.aadhaarNumber).slice(-4) : "4321";

  const handleComplete = () => {
    if (!isOtpComplete) return;
    nextStep();
  };

  const goBackToAadhaar = () => {
    const prevStepId = journeySteps[currentStepIndex - 1]?.id;
    if (prevStepId) goToStep(prevStepId);
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
        <div className="flex items-center justify-between mb-2">
          <Label className="text-slate-700">Aadhaar OTP</Label>
          <button type="button" onClick={goBackToAadhaar} className="text-sm text-dashboard-primary font-medium hover:underline">
            Edit Aadhaar
          </button>
        </div>
        <Input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          className="h-14 text-center text-xl font-semibold tracking-[0.4em] font-mono border-2 border-slate-200 rounded-lg focus:border-dashboard-primary focus:ring-2 focus:ring-dashboard-primary/20"
          autoComplete="one-time-code"
        />
        <p className="text-sm text-slate-600 mt-2">
          We've sent a code to the mobile number registered with Aadhaar ending in xxxx {aadhaarLast4}
        </p>
        <p className="text-sm text-slate-600 mt-1">
          {resendTimer > 0 ? `Resend code in ${resendTimer}s` : <button type="button" onClick={() => setResendTimer(23)} className="text-dashboard-primary font-medium hover:underline">Resend code</button>}
        </p>
      </div>

      <Button
        type="button"
        onClick={handleComplete}
        disabled={!isOtpComplete}
        className="w-full sm:w-auto bg-dashboard-primary hover:bg-dashboard-primary-dark text-white"
      >
        Complete Verification
      </Button>
    </StepCard>
  );
}
