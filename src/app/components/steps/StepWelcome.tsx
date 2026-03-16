"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { useBranding } from "@/app/context/BrandingContext";
import { useJourneyConfig } from "@/app/context/JourneyConfigContext";
import type { FieldConfig, FieldKind } from "@/app/context/JourneyConfigContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, ArrowRight, ShieldCheck, Bookmark } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import StepCard from "@/app/components/layout/StepCard";
import { Checkbox } from "@/components/ui/checkbox";
import { WelcomeFieldRenderer } from "@/app/components/shared/StepFieldRenderer";

export default function StepWelcome() {
  const { updateFormData, formData, prefilledData, addNotification, nextStep, setBottomBarContent, journeySteps, currentStepIndex, journeyType } = useJourney();
  const { config } = useBranding();
  const { config: journeyConfig } = useJourneyConfig();

  const [name, setName] = useState(formData.name || "");
  const [mobileNumber, setMobileNumber] = useState(formData.mobileNumber || "");
  const [dob, setDob] = useState(formData.dob || "");
  const [email, setEmail] = useState(formData.email || "");
  const [pan, setPan] = useState(formData.pan || "");
  const [aadhaarNumber, setAadhaarNumber] = useState(formData.aadhaarNumber || "");
  const [consent, setConsent] = useState(false);
  const [companyPortalConsent, setCompanyPortalConsent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Welcome step: only name and mobile number for all journey types (NTB, ETB, ETB-NK). Ignore any extra fields from config.
  const welcomeFields = useMemo(() => {
    const defaultOrder: FieldConfig[] = [
      { id: "name", label: "Full Name", source: "bank-api" },
      { id: "mobileNumber", label: "Mobile Number", source: "bank-api" },
    ];
    const layout = journeyConfig.stepFieldLayouts?.welcome;
    if (!layout?.length) return defaultOrder;
    const filtered = layout.filter((f) => f.id === "name" || f.id === "mobileNumber");
    return filtered.length > 0 ? filtered : defaultOrder;
  }, [journeyConfig.stepFieldLayouts?.welcome]);

  const dataFieldsOnly = useMemo(
    () => welcomeFields.filter((f) => f.id !== "otp"),
    [welcomeFields]
  );
  const lastBottomBarKeyRef = useRef<string | null>(null);
  const otpSectionRef = useRef<HTMLDivElement | null>(null);
  const otpInputRef = useRef<HTMLInputElement | null>(null);
  const isEtbAutoConversion = journeyType === "etb";

  const stepLabel = React.useMemo(() => {
    const total = journeySteps.length || 0;
    if (!total) return undefined;
    return `Step ${currentStepIndex + 1} of ${total}`;
  }, [journeySteps.length, currentStepIndex]);

  useEffect(() => {
    trackEvent('page_viewed', { page: 'welcome' });
  }, []);

  // Sync prefilled formData into local state when it changes (e.g. from invite/demo)
  // Welcome page: only name and mobileNumber are prefilled; aadhaar never prefilled
  useEffect(() => {
    if (otpSent) return;
    if (formData.name != null) setName(String(formData.name));
    if (formData.mobileNumber != null) setMobileNumber(String(formData.mobileNumber));
    if (formData.dob != null) setDob(String(formData.dob));
    if (formData.email != null) setEmail(String(formData.email));
    if (formData.pan != null) setPan(String(formData.pan));
    if (formData.aadhaarNumber != null) setAadhaarNumber(String(formData.aadhaarNumber));
    if (formData.ekycUidaiConsent === true) setConsent(true);
  }, [formData.name, formData.mobileNumber, formData.dob, formData.email, formData.pan, formData.aadhaarNumber, formData.ekycUidaiConsent, otpSent]);

  // When company portal consent is given, prefill the rest of the journey (excluding aadhaar)
  useEffect(() => {
    if (!companyPortalConsent || !journeyConfig.prefillOnConsent) return;
    const rest = { ...prefilledData };
    delete rest.aadhaarNumber;
    delete rest.name;
    delete rest.mobileNumber;
    if (Object.keys(rest).length > 0) {
      updateFormData(rest);
    }
  }, [companyPortalConsent, journeyConfig.prefillOnConsent, prefilledData, updateFormData]);

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    const hasField = (id: FieldKind) => dataFieldsOnly.some((f) => f.id === id);

    if (hasField("name") && !name?.trim()) {
      errors.name = journeyConfig.errorMessages.requiredField || "Please enter your full name";
    }
    const mobileRegex = /^[6-9]\d{9}$/;
    if (hasField("mobileNumber") && (!mobileNumber || !mobileRegex.test(mobileNumber))) {
      errors.mobileNumber = journeyConfig.errorMessages.requiredField || "Please enter a valid 10-digit mobile number";
    }
    if (hasField("dob") && !dob) {
      errors.dob = journeyConfig.errorMessages.requiredField || "Please provide your date of birth";
    }
    if (hasField("email")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) errors.email = journeyConfig.errorMessages.requiredField || "Please enter your email";
      else if (!emailRegex.test(email)) errors.email = "Please enter a valid email address";
    }
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (hasField("pan")) {
      if (!pan) errors.pan = journeyConfig.errorMessages.requiredField || "Please enter your PAN number";
      else if (!panRegex.test(pan)) errors.pan = "Please enter a valid Indian PAN (e.g. ABCDE1234F)";
    }
    if (hasField("aadhaarNumber")) {
      const aadhaarRaw = (aadhaarNumber || "").replace(/\D/g, "");
      if (aadhaarRaw.length !== 12) {
        errors.aadhaarNumber = journeyConfig.errorMessages.requiredField || "Please enter a valid 12-digit Aadhaar number";
      }
    }
    if (!consent) {
      errors.consent = journeyConfig.errorMessages.consentRequired || "Please accept the terms to continue";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [consent, name, dob, email, mobileNumber, pan, aadhaarNumber, dataFieldsOnly, journeyConfig.errorMessages]);

  const requestOtp = useCallback(async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    updateFormData({
      name: name?.trim(),
      mobileNumber,
      dob,
      pan,
      companyPortalConsent,
      ...(dataFieldsOnly.some((f) => f.id === "email") ? { email } : {}),
      ...(dataFieldsOnly.some((f) => f.id === "aadhaarNumber") ? { aadhaarNumber: (aadhaarNumber || "").replace(/\D/g, "") } : {}),
    });

    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      addNotification(`${config.name}`, `Your OTP is: 481230`);
    }, 800);
  }, [addNotification, config.name, name, dob, email, mobileNumber, pan, aadhaarNumber, companyPortalConsent, dataFieldsOnly, updateFormData, validateForm]);

  useEffect(() => {
    if (!isEtbAutoConversion || otpSent) return;
    updateFormData({
      name: name?.trim(),
      mobileNumber,
      dob,
      pan,
      companyPortalConsent,
      ...(dataFieldsOnly.some((f) => f.id === "email") ? { email } : {}),
      ...(dataFieldsOnly.some((f) => f.id === "aadhaarNumber") ? { aadhaarNumber: (aadhaarNumber || "").replace(/\D/g, "") } : {}),
    });
    setOtpSent(true);
    addNotification(`${config.name}`, `Your OTP is: 481230`);
  }, [addNotification, config.name, name, dob, email, mobileNumber, otpSent, pan, aadhaarNumber, companyPortalConsent, dataFieldsOnly, updateFormData]);

  const DEMO_OTP = "123456";

  const verifyOtp = useCallback(() => {
    if (otp.length !== 6) return;
    // Demo mode: fixed OTP 123456 succeeds; any 6 digits in dev
    const isValid = otp === DEMO_OTP || process.env.NODE_ENV === "development";
    if (!isValid) {
      setValidationErrors((p) => ({ ...p, otp: journeyConfig.errorMessages.otpValidationFailed || "Invalid OTP" }));
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      nextStep();
    }, 800);
  }, [nextStep, otp, journeyConfig.errorMessages.otpValidationFailed]);

  useEffect(() => {
    if (!otpSent) return;

    // Mobile-first: ensure OTP section is visible and focused.
    // Use rAF so layout has committed before scrolling.
    const id = requestAnimationFrame(() => {
      otpSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      otpInputRef.current?.focus?.();
    });
    return () => cancelAnimationFrame(id);
  }, [otpSent]);

  useEffect(() => {
    const primaryLabel = journeyConfig.ctaLabels.continue ?? "Continue";
    const disabled = isLoading || (otpSent ? otp.length !== 6 : false);
    const onClick = otpSent ? verifyOtp : requestOtp;
    const resolvedLabel = isEtbAutoConversion ? (journeyConfig.ctaLabels.verifyOtp ?? journeyConfig.ctaLabels.continue ?? "Continue") : primaryLabel;
    const resolvedDisabled = isEtbAutoConversion ? isLoading || otp.length !== 6 || !consent : disabled;
    const resolvedClick = isEtbAutoConversion ? verifyOtp : onClick;
    const bottomBarKey = `${otpSent}|${isLoading}|${otp.length}|${name}|${mobileNumber}|${dob}|${pan}|${email}|${aadhaarNumber}|${consent}|${companyPortalConsent}`;

    // Prevent any accidental render -> effect -> state -> render loops by ensuring
    // we only update the bottom bar when its inputs meaningfully change.
    if (lastBottomBarKeyRef.current === bottomBarKey) return;
    lastBottomBarKeyRef.current = bottomBarKey;

    setBottomBarContent(
      <div className="w-full flex justify-end">
        <Button
          type="button"
          onClick={resolvedClick}
          disabled={resolvedDisabled}
          variant="primary-cta"
          className="btn-primary w-full md:w-[360px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {otpSent ? "Verifying..." : "Sending OTP..."}
            </>
          ) : (
            <>
              {resolvedLabel}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    );
  }, [dob, isEtbAutoConversion, isLoading, name, mobileNumber, otp.length, otpSent, pan, email, aadhaarNumber, consent, companyPortalConsent, requestOtp, setBottomBarContent, verifyOtp, journeyConfig.ctaLabels.verifyOtp]);

  const heroTitle = journeyConfig.stepTitles.heroTitle;
  const heroSubtitle = journeyConfig.stepTitles.heroSubtitle;

  return (
    <StepCard step={stepLabel} maxWidth="6xl">
      {heroTitle && (
        <div className="rounded-2xl p-6 mb-6 text-center border border-slate-100 bg-slate-50/50">
          <h2 className="text-xl md:text-2xl font-bold" style={{ color: "var(--primary-bank)" }}>{heroTitle}</h2>
          {heroSubtitle && <p className="text-sm text-slate-600 mt-1">{heroSubtitle}</p>}
        </div>
      )}
      {/* Header */}
      <div className="page-header mb-6">
        <h1 className="page-title text-2xl md:text-3xl">{journeyConfig.stepTitles.welcome}</h1>
        <p className="page-subtitle text-slate-600 mt-1">
          Please provide your details to begin your account setup
        </p>
      </div>

      {/* Save & Continue Later - compact */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-500 flex items-center gap-1.5">
          <Bookmark className="w-3.5 h-3.5 text-slate-400" />
          Progress saved automatically
        </span>
        <button
          type="button"
          onClick={() => {
            updateFormData({ name, mobileNumber, dob, pan, email, aadhaarNumber, companyPortalConsent });
            addNotification(config.name, "Progress saved. Use the same link or add ?resume=true to continue.");
          }}
          className="text-sm font-medium text-[var(--primary-bank)] hover:underline"
        >
          Save & continue later →
        </button>
      </div>

      {/* Form - 2-column layout */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!otpSent) requestOtp();
        }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          {/* Dynamic fields from stepFieldLayouts - distributed in 2 cols */}
          {dataFieldsOnly.map((field) => {
          const valueMap: Record<string, string> = {
            name,
            mobileNumber,
            dob,
            email,
            pan,
            aadhaarNumber,
          };
          const setterMap: Record<string, (v: string) => void> = {
            name: (v) => {
              setName(v);
              if (validationErrors.name) setValidationErrors((p) => { const n = { ...p }; delete n.name; return n; });
            },
            mobileNumber: (v) => {
              setMobileNumber(v);
              if (validationErrors.mobileNumber) setValidationErrors((p) => { const n = { ...p }; delete n.mobileNumber; return n; });
            },
            dob: (v) => {
              setDob(v);
              if (validationErrors.dob) setValidationErrors((p) => { const n = { ...p }; delete n.dob; return n; });
            },
            email: (v) => {
              setEmail(v);
              if (validationErrors.email) setValidationErrors((p) => { const n = { ...p }; delete n.email; return n; });
            },
            pan: (v) => {
              setPan(v);
              if (validationErrors.pan) setValidationErrors((p) => { const n = { ...p }; delete n.pan; return n; });
            },
            aadhaarNumber: (v) => {
              setAadhaarNumber(v);
              if (validationErrors.aadhaarNumber) setValidationErrors((p) => { const n = { ...p }; delete n.aadhaarNumber; return n; });
            },
          };
          const isPrefilled =
            (journeyType === "etb" || journeyType === "etb-nk" || journeyType === "ntb" || journeyType === "ntb-conversion") &&
            (field.id === "name" || field.id === "mobileNumber") &&
            !!valueMap[field.id];
          if (!(field.id in valueMap) || !(field.id in setterMap)) return null;
          return (
            <WelcomeFieldRenderer
              key={field.id}
              field={field}
              value={valueMap[field.id]}
              onChange={setterMap[field.id]}
              error={validationErrors[field.id]}
              disabled={otpSent}
              isPrefilled={false}
            />
          );
        })}

          {/* OTP inline with Aadhaar - same row in grid when sent */}
          {otpSent && (
            <div
              ref={otpSectionRef}
              className="animate-in fade-in duration-300"
            >
              <label htmlFor="otp" className="form-label flex items-center gap-2">
                Verification code
              </label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                ref={otpInputRef}
                className="enterprise-input text-center tracking-[0.25em] font-mono"
                placeholder="• • • • • •"
                autoFocus
                disabled={isLoading}
              />
              {validationErrors.otp && (
                <p className="error-text mt-1 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.otp}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                <button
                  type="button"
                  className="btn-link text-xs"
                  onClick={() => { setOtpSent(false); setOtp(""); }}
                >
                  Change number
                </button>
                <span className="text-slate-300">|</span>
                <button type="button" className="btn-link text-xs" onClick={requestOtp}>
                  Resend code
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Demo: {DEMO_OTP}</p>
            </div>
          )}
        </div>

        {/* Consent - full width */}
        <div className="pt-2 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">Consent</span>
          </div>
          <label className="flex items-start gap-3 cursor-pointer group">
            <Checkbox
              checked={consent}
              onCheckedChange={(v) => {
                const next = v === true;
                setConsent(next);
                if (validationErrors.consent) {
                  setValidationErrors((prev) => { const n = { ...prev }; delete n.consent; return n; });
                }
              }}
              className="mt-0.5 rounded-[var(--radius)] border-gray-300 data-[state=checked]:bg-[var(--primary-bank)] data-[state=checked]:border-[var(--primary-bank)]"
            />
            <span className="text-sm text-gray-600 leading-relaxed">
              {dataFieldsOnly.some((f) => f.id === "aadhaarNumber") && journeyConfig.legalTexts.aadhaarConsent
                ? journeyConfig.legalTexts.aadhaarConsent
                : `I authorize ${config.name} to access my credit information and KYC details for account opening purposes.`}
            </span>
          </label>
          {journeyConfig.prefillOnConsent && Object.keys(prefilledData).some((k) => !["name", "mobileNumber"].includes(k)) && (
            <label className="flex items-start gap-3 cursor-pointer group">
              <Checkbox
                checked={companyPortalConsent}
                onCheckedChange={(v) => {
                  setCompanyPortalConsent(v === true);
                }}
                className="mt-0.5 rounded-[var(--radius)] border-gray-300 data-[state=checked]:bg-[var(--primary-bank)] data-[state=checked]:border-[var(--primary-bank)]"
              />
              <span className="text-sm text-gray-600 leading-relaxed">
                {journeyConfig.legalTexts.companyPortalConsent ||
                  "I consent to fetch my data from my company portal to prefill this application. If I do not consent, I will enter all details manually."}
              </span>
            </label>
          )}
          {validationErrors.consent && (
            <p className="error-text mt-2">
              <AlertCircle className="w-4 h-4" />
              {validationErrors.consent}
            </p>
          )}
        </div>
      </form>
    </StepCard>
  );
}
