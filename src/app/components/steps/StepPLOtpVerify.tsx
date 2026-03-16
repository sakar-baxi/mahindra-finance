"use client";

import React, { useState, useEffect } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import StepCard from "@/app/components/layout/StepCard";
import { ArrowRight } from "lucide-react";

/** Step 2: OTP verification – Single 6-digit input, Resend, Verify & Continue. */
export default function StepPLOtpVerify() {
  const { formData, nextStep, journeySteps, currentStepIndex } = useJourney();
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  const total = journeySteps.length;
  const stepLabel = total ? `Step ${currentStepIndex + 1} of ${total}` : null;
  const otpDigits = otp.replace(/\D/g, "").slice(0, 6);
  const isOtpComplete = otpDigits.length === 6;

  const handleVerify = () => {
    if (!isOtpComplete) return;
    nextStep();
  };

  const handleResend = () => {
    setResendTimer(30);
  };

  return (
    <StepCard maxWidth="2xl" step={stepLabel ?? undefined}>
      <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-800 mb-6">
        OTP Sent. Please verify.
      </div>
      <h1 className="text-xl font-bold text-slate-900 mb-1">Enter Verification Code</h1>
      <p className="text-slate-600 text-sm mb-4">We've sent a 6-digit code to +91 {formData.mobileNumber || formData.phone || "******"}</p>

      <div className="mb-4">
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
      </div>

      <p className="text-sm text-slate-600 mb-6">
        {resendTimer > 0 ? (
          <span>Resend code in {resendTimer}s</span>
        ) : (
          <button type="button" onClick={handleResend} className="text-dashboard-primary font-medium hover:underline">
            Resend code
          </button>
        )}
      </p>

      <Button
        type="button"
        onClick={handleVerify}
        disabled={!isOtpComplete}
        className="w-full sm:w-auto bg-dashboard-primary hover:bg-dashboard-primary-dark text-white"
      >
        Verify & Continue <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </StepCard>
  );
}
