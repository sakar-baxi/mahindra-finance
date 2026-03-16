"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { useJourneyConfig } from "@/app/context/JourneyConfigContext";
import { Button } from "@/app/components/ui/button";
import { AlertCircle, CheckCircle2, Video, Shield } from "lucide-react";
import StepCard from "@/app/components/layout/StepCard";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type VkycPhase = "consent" | "camera" | "complete";

export default function StepVideoKycEnhanced() {
  const { nextStep, setBottomBarContent, updateFormData, formData } = useJourney();
  const { config } = useJourneyConfig();
  const bankName = config.bankName || "your bank";

  const [phase, setPhase] = useState<VkycPhase>("consent");
  const [consent, setConsent] = useState(!!formData.vkycConsent);
  const [presentInIndia, setPresentInIndia] = useState(!!formData.vkycPresentInIndia);
  const [showErrors, setShowErrors] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const requestCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      return true;
    } catch (e) {
      setCameraError("Camera access denied. Please allow camera to continue.");
      return false;
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => {
    if (phase === "camera") {
      requestCamera();
    }
    return () => {
      if (phase !== "camera") stopCamera();
    };
  }, [phase, requestCamera, stopCamera]);

  const isConsentValid = consent && presentInIndia;

  const handleStart = () => {
    setShowErrors(true);
    if (!isConsentValid) return;
    setPhase("camera");
  };

  useEffect(() => {
    if (phase === "camera") {
      const timer = setTimeout(() => {
        stopCamera();
        updateFormData({ vkycConsent: true, vkycPresentInIndia: true });
        setPhase("complete");
        setTimeout(nextStep, 1500);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase, stopCamera, updateFormData, nextStep]);

  useEffect(() => {
    setBottomBarContent(null);
  }, [phase, setBottomBarContent]);

  return (
    <StepCard maxWidth="6xl">
      <div className="page-header">
        <h1 className="page-title">Video KYC</h1>
        <p className="page-subtitle">
          Complete your identity verification with {bankName} in under 2 minutes.
        </p>
      </div>

      {/* Phase: Consent + Instructions (merged) */}
      {phase === "consent" && (
        <div className="space-y-6">
          <div className={cn("rounded-xl border p-4 space-y-4", !isConsentValid && showErrors && "attention-pulse")}>
            <p className="text-sm font-semibold text-gray-900">Consent & Instructions</p>
            {(config.legalTexts.vkycConsent ?? []).length > 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-3 text-sm text-slate-700 space-y-2">
                {(config.legalTexts.vkycConsent ?? []).map((line: string, i: number) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-3 text-sm text-slate-700 space-y-2">
                <p>I consent to complete KYC through VCIP (Video Customer Identification Process) as prescribed by RBI.</p>
                <p>I authorize {bankName} to open my account using Aadhaar OTP-based e-KYC if Video KYC is unsuccessful.</p>
              </div>
            )}
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-bank)]" />
                Keep your PAN card ready
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-bank)]" />
                Ensure good lighting
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-bank)]" />
                Stable internet connection needed
              </li>
            </ul>
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={consent}
                onCheckedChange={(v) => {
                  setConsent(v === true);
                  updateFormData({ vkycConsent: v === true });
                }}
                className="mt-0.5"
              />
              <span className="text-sm">I agree to the above consent.</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={presentInIndia}
                onCheckedChange={(v) => {
                  setPresentInIndia(v === true);
                  updateFormData({ vkycPresentInIndia: v === true });
                }}
                className="mt-0.5"
              />
              <span className="text-sm">{config.legalTexts.vkycPresentInIndia}</span>
            </label>
            {showErrors && !isConsentValid && (
              <p className="error-text">
                <AlertCircle className="w-4 h-4" />
                {config.errorMessages.consentBothRequired}
              </p>
            )}
          </div>
          <Button onClick={handleStart} disabled={!isConsentValid} className="w-full h-12">
            <Video className="w-5 h-5 mr-2" />
            Start Video Verification
          </Button>
        </div>
      )}

      {/* Phase: Camera (mock - 2 seconds) */}
      {phase === "camera" && (
        <div className="space-y-4">
          <p className="text-sm font-semibold">Verifying your identity</p>
          {cameraError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center space-y-4">
              <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
              <p className="text-red-700">{cameraError}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={() => { setCameraError(null); requestCamera(); }} className="border-red-200 text-red-700 hover:bg-red-50">
                  Try again
                </Button>
                <a
                  href={`tel:${(config.support?.supportPhone ?? "180010888").replace(/\s/g, "")}`}
                  className="inline-block py-2 px-3 text-sm font-medium text-slate-600 hover:text-slate-800 underline rounded-md hover:bg-slate-100 transition-colors"
                >
                  Can&apos;t use camera? Call {config.support.supportPhone ?? "1800-425-4332"} or visit a branch
                </a>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl bg-slate-900 aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      )}

      {/* Phase: Complete */}
      {phase === "complete" && (
        <div className="rounded-2xl bg-green-50 border border-green-100 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-bold text-green-900">Verification Successful</h3>
          <p className="text-green-700 text-sm">Your Video KYC is complete.</p>
        </div>
      )}

      <div className="flex items-center justify-center gap-4 grayscale opacity-40 mt-6">
        <Shield className="w-4 h-4" />
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">AES-256 Encrypted</span>
      </div>
    </StepCard>
  );
}
