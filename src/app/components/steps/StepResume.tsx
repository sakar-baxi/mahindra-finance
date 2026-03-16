"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { useBranding } from "@/app/context/BrandingContext";
import { useJourneyConfig } from "@/app/context/JourneyConfigContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, ArrowRight, RotateCcw } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import StepCard from "@/app/components/layout/StepCard";

const LOCAL_STORAGE_PREFIX = "hdfcJourney_";
const DEMO_OTP = "123456"; // Demo mode: this OTP always succeeds

export default function StepResume() {
  const { updateFormData, formData, nextStep, setBottomBarContent, journeySteps } = useJourney();
  const { config } = useBranding();
  const { config: journeyConfig } = useJourneyConfig();

  const [mobileNumber, setMobileNumber] = useState(formData.mobileNumber || "");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileError, setMobileError] = useState("");
  const [otpError, setOtpError] = useState("");
  const otpInputRef = useRef<HTMLInputElement | null>(null);

  const savedStepIndex = typeof window !== "undefined"
    ? parseInt(localStorage.getItem(`${LOCAL_STORAGE_PREFIX}stepIndex`) || "0", 10)
    : 0;
  const targetStepTitle = savedStepIndex > 0 && journeySteps[savedStepIndex]
    ? journeySteps[savedStepIndex].title
    : "where you left off";

  useEffect(() => {
    trackEvent("page_viewed", { page: "resume" });
  }, []);

  useEffect(() => {
    if (formData.mobileNumber) setMobileNumber(String(formData.mobileNumber));
  }, [formData.mobileNumber]);

  const requestOtp = useCallback(() => {
    setMobileError("");
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileNumber || !mobileRegex.test(mobileNumber)) {
      setMobileError(journeyConfig.errorMessages.requiredField || "Please enter a valid 10-digit mobile number");
      return;
    }
    setIsLoading(true);
    updateFormData({ mobileNumber });
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      requestAnimationFrame(() => otpInputRef.current?.focus());
    }, 800);
  }, [mobileNumber, updateFormData, journeyConfig.errorMessages.requiredField]);

  const verifyOtp = useCallback(() => {
    setOtpError("");
    if (otp.length !== 6) {
      setOtpError("Please enter the 6-digit code");
      return;
    }
    // Demo/prototype: fixed OTP 123456 always succeeds; any 6 digits in dev
    const isValid = otp === DEMO_OTP || (process.env.NODE_ENV === "development" && otp.length === 6);
    if (!isValid) {
      setOtpError(journeyConfig.errorMessages.otpValidationFailed || "Invalid OTP. Please try again.");
      return;
    }
    setIsLoading(true);
    updateFormData({ mobileNumber, otpVerified: true });
    setTimeout(() => {
      setIsLoading(false);
      nextStep();
    }, 500);
  }, [otp, mobileNumber, updateFormData, nextStep, journeyConfig.errorMessages.otpValidationFailed]);

  const handleChangeNumber = useCallback(() => {
    setOtpSent(false);
    setOtp("");
    setOtpError("");
  }, []);

  useEffect(() => {
    setBottomBarContent(
      <div className="w-full flex justify-end">
        <Button
          type="button"
          onClick={otpSent ? verifyOtp : requestOtp}
          disabled={isLoading || (otpSent ? otp.length !== 6 : !mobileNumber)}
          variant="primary-cta"
          className="btn-primary w-full md:w-[360px]"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {otpSent ? journeyConfig.ctaLabels.verifyOtp : "Get OTP"}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    );
  }, [otpSent, otp.length, mobileNumber, isLoading, requestOtp, verifyOtp, setBottomBarContent, journeyConfig.ctaLabels.verifyOtp]);

  return (
    <StepCard maxWidth="6xl">
      <div className="flex flex-col items-center text-center mb-8">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: "color-mix(in srgb, var(--primary-bank) 20%, white)" }}
        >
          <RotateCcw className="w-8 h-8" style={{ color: "var(--primary-bank)" }} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Resume Your Journey</h1>
        <p className="mt-2 text-slate-600">
          Welcome back! Verify your mobile to continue from <strong>{targetStepTitle}</strong>.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (otpSent) verifyOtp();
          else requestOtp();
        }}
        className="space-y-5"
      >
        {!otpSent ? (
          <div>
            <label htmlFor="resume-mobile" className="form-label">
              Mobile number linked with your account
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 font-medium text-sm z-10">+91</span>
              <Input
                id="resume-mobile"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={mobileNumber}
                onChange={(e) => {
                  setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10));
                  if (mobileError) setMobileError("");
                }}
                className={`enterprise-input pl-12 ${mobileError ? "error" : ""}`}
                placeholder="98765 43210"
                disabled={isLoading}
                aria-invalid={!!mobileError}
                aria-describedby={mobileError ? "resume-mobile-error" : undefined}
              />
            </div>
            {mobileError && (
              <p id="resume-mobile-error" className="error-text mt-1" role="alert">
                <AlertCircle className="w-4 h-4" />
                {mobileError}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-medium">OTP sent to +91 {mobileNumber}</p>
              <button
                type="button"
                onClick={handleChangeNumber}
                className="text-xs text-blue-600 hover:text-blue-700 underline mt-1"
              >
                Change number
              </button>
            </div>
            <div>
              <label htmlFor="resume-otp" className="form-label">
                Enter 6-digit verification code
              </label>
              <Input
                id="resume-otp"
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  if (otpError) setOtpError("");
                }}
                className="enterprise-input text-center text-2xl tracking-[0.5em] font-mono"
                placeholder="• • • • • •"
                autoFocus
                disabled={isLoading}
                aria-invalid={!!otpError}
                aria-describedby={otpError ? "resume-otp-error" : undefined}
              />
              {otpError && (
                <p id="resume-otp-error" className="error-text mt-1" role="alert">
                  <AlertCircle className="w-4 h-4" />
                  {otpError}
                </p>
              )}
            </div>
          </div>
        )}
      </form>

      <p className="mt-6 text-center text-[11px] text-slate-400">
        Demo: Use <code className="bg-slate-100/80 px-1.5 py-0.5 rounded text-slate-500">{DEMO_OTP}</code> to verify
      </p>
    </StepCard>
  );
}
