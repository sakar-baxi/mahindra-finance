"use client";

import React, { useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { useJourneyConfig } from "@/app/context/JourneyConfigContext";
import AgentMessage from "@/app/components/chat/AgentMessage";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function StepConversationalConfirm() {
  const { nextStep, formData, updateFormData } = useJourney();
  const { config } = useJourneyConfig();
  const bankName = config.bankName || "your bank";
  const firstName = (formData.name || "there").split(" ")[0] || "there";
  const mobile = formData.mobileNumber || "9876543210";

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = () => {
    if (otp.length !== 6) return;
    setIsVerifying(true);
    updateFormData({ otp });
    setTimeout(() => {
      setIsVerifying(false);
      nextStep();
    }, 800);
  };

  const isOtpValid = otp.length === 6;

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <AgentMessage isNew={true}>
        We&apos;re processing your request with {bankName}. Almost there.
      </AgentMessage>
      <AgentMessage isNew={true}>
        We&apos;ve sent a one-time code to your mobile. Please enter it below to complete the verification.
      </AgentMessage>
      <div className="pl-8 space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-4">
          <p className="text-sm text-slate-600 mb-2">OTP sent to:</p>
          <p className="font-semibold text-slate-900">{mobile}</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Enter OTP</label>
          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="••••••"
            className="h-12 text-center text-lg font-mono tracking-[0.5em]"
          />
          <p className="text-xs text-slate-500">Enter the 6-digit code sent to your mobile</p>
        </div>
        <AgentMessage isNew={true}>
          Once you verify, we&apos;ll activate your account right away. Take your time, {firstName}.
        </AgentMessage>
        <Button
          onClick={handleVerify}
          disabled={!isOtpValid || isVerifying}
          className="w-full h-12 bg-[var(--primary-bank)] hover:opacity-90 text-white font-semibold disabled:opacity-50"
        >
          {isVerifying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {config.ctaLabels.verifyOtp}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
