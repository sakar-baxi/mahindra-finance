"use client";

import React, { useState, useEffect } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { useJourneyConfig } from "@/app/context/JourneyConfigContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, Shield, CreditCard, CalendarDays, Mail } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import StepCard from "@/app/components/layout/StepCard";
import { Checkbox } from "@/components/ui/checkbox";

/** Aadhaar e-KYC: PAN, Aadhaar, dob, email (remaining from Welcome) + Aadhaar OTP verification - all on same page. */
export default function StepEkycHandler() {
  const { nextStep, formData, updateFormData, setBottomBarContent } = useJourney();
  const { config: journeyConfig } = useJourneyConfig();
  const [pan, setPan] = useState(formData.pan || "");
  const [dob, setDob] = useState(formData.dob || "");
  const [email, setEmail] = useState(formData.email || "");
  const [aadhaarNumber, setAadhaarNumber] = useState(formData.aadhaarNumber || "");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [timer, setTimer] = useState(30);
  const [uidaiConsent, setUidaiConsent] = useState<boolean>(!!formData.ekycUidaiConsent);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    trackEvent('page_viewed', { page: 'ekyc_handler' });
  }, []);

  useEffect(() => {
    if (otpSent && timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [otpSent, timer]);

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isFormValid = pan && panRegex.test(pan) && dob && email && emailRegex.test(email) && aadhaarNumber.replace(/\D/g, "").length === 12 && uidaiConsent;

  const sendOtp = () => {
    setShowErrors(true);
    if (!pan || !panRegex.test(pan)) {
      setValidationError("Please enter a valid PAN (e.g. ABCDE1234F).");
      return;
    }
    if (!dob) {
      setValidationError("Please enter your date of birth.");
      return;
    }
    if (!email || !emailRegex.test(email)) {
      setValidationError("Please enter a valid email address.");
      return;
    }
    if (aadhaarNumber.replace(/\D/g, "").length !== 12) {
      setValidationError("Please enter a valid 12-digit Aadhaar number.");
      return;
    }
    if (!uidaiConsent) {
      setValidationError("Please provide consent to proceed with Aadhaar e-KYC.");
      return;
    }
    setValidationError("");
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      updateFormData({ pan, dob, email, aadhaarNumber: aadhaarNumber.replace(/\D/g, ""), ekycUidaiConsent: uidaiConsent });
    }, 800);
  };

  const verifyOtp = () => {
    if (otp.length !== 6) {
      setValidationError("Please enter a valid 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    trackEvent('ekyc_otp_verified');

    setTimeout(() => {
      setIsLoading(false);
      nextStep();
    }, 800);
  };

  useEffect(() => {
    const primaryLabel = otpSent
      ? (journeyConfig.ctaLabels.verifyAadhaar ?? journeyConfig.ctaLabels.verifyOtp ?? "Complete Verification")
      : (journeyConfig.ctaLabels.getOtp ?? "Verify Identity");
    const disabled =
      isLoading ||
      (otpSent ? otp.length !== 6 : !isFormValid);

    setBottomBarContent(
      <div className="w-full flex justify-end">
        <Button
          type="button"
          onClick={() => (otpSent ? verifyOtp() : sendOtp())}
          disabled={disabled}
          className="btn-primary w-full md:w-[360px]"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : primaryLabel}
        </Button>
      </div>
    );
  }, [otpSent, isLoading, otp.length, isFormValid, setBottomBarContent, journeyConfig.ctaLabels]);

  return (
    <StepCard maxWidth="6xl">
      <div className="page-header mb-6">
        <h1 className="page-title text-2xl md:text-3xl">Aadhaar e-KYC</h1>
        <p className="page-subtitle text-slate-600 mt-1">Instant identity verification using UIDAI ecosystem.</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
          <Shield className="w-5 h-5 text-blue-600" />
          <p className="text-sm text-blue-900 leading-tight">
            <span className="font-bold">Secure Verification.</span> Your Aadhaar data is encrypted and used only for identity validation as per RBI guidelines.
          </p>
        </div>

        {!otpSent ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendOtp();
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="form-label flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  PAN Number
                </label>
                <Input
                  type="text"
                  maxLength={10}
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  className="enterprise-input uppercase"
                  placeholder="ABCDE1234F"
                />
              </div>
              <div className="space-y-2">
                <label className="form-label flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-slate-400" />
                  Date of Birth
                </label>
                <Input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="enterprise-input"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="form-label flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="enterprise-input"
                  placeholder="name@example.com"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="form-label">Aadhaar Number</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={14}
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  className="enterprise-input text-center tracking-[0.2em]"
                  placeholder="0000 0000 0000"
                />
              </div>
            </div>

            <div className={cn("rounded-xl border border-slate-200/80 bg-slate-50/50 p-5", !uidaiConsent ? "attention-pulse" : "")}>
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={uidaiConsent}
                  onCheckedChange={(v) => {
                    const next = v === true;
                    setUidaiConsent(next);
                    updateFormData({ ekycUidaiConsent: next });
                    if (showErrors) setValidationError("");
                  }}
                  className="mt-0.5 rounded-[var(--radius)] border-gray-300 data-[state=checked]:bg-[#004C8F] data-[state=checked]:border-[#004C8F]"
                />
                <span className="text-sm text-gray-700 leading-relaxed">
                  {journeyConfig.legalTexts.aadhaarConsent ??
                    "I voluntarily authorize the Bank to use my Aadhaar details for eKYC authentication and to fetch my KYC details from UIDAI for account opening. I indemnify the Bank against losses arising due to any difference in my name on Aadhaar and PAN, if any."}
                </span>
              </label>
              {showErrors && !uidaiConsent && (
                <p className="error-text mt-2">
                  <AlertCircle className="w-4 h-4" />
                  {journeyConfig.errorMessages.consentRequired}
                </p>
              )}
            </div>
            {validationError && (
              <p className="error-text">
                <AlertCircle className="w-4 h-4" />
                {validationError}
              </p>
            )}
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              verifyOtp();
            }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="form-label">Aadhaar OTP</label>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="btn-link text-xs"
                >
                  Edit Aadhaar
                </button>
              </div>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="enterprise-input text-center text-xl tracking-[0.5em] font-bold"
                placeholder="000000"
                autoFocus
              />
              <p className="text-xs text-center text-slate-500 mt-2">
                We&apos;ve sent a code to the mobile number registered with Aadhaar ending in <span className="font-semibold text-slate-900">xxxx {aadhaarNumber.replace(/\D/g, "").slice(-4)}</span>
              </p>
            </div>

            <div className="text-center">
              <button
                type="button"
                className={cn(
                  "text-sm transition-colors",
                  timer > 0 ? "text-slate-400 cursor-not-allowed" : "text-blue-600 font-medium hover:underline"
                )}
                disabled={timer > 0 || isLoading}
                onClick={() => setTimer(30)}
              >
                {timer > 0 ? `Resend code in ${timer}s` : "Resend OTP"}
              </button>
            </div>
          </form>
        )}
      </div>
    </StepCard>
  );
}
