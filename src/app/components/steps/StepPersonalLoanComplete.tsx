"use client";

import React, { useEffect, useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import StepCard from "@/app/components/layout/StepCard";
import { CheckCircle2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

// Generate a deterministic enquiry number from timestamp + name
function getEnquiryNumber(): string {
  if (typeof window === "undefined") return "169054969";
  const t = Date.now().toString().slice(-9);
  return t.padStart(9, "0");
}

export default function StepPersonalLoanComplete() {
  const { formData, prefilledData } = useJourney();
  const [enquiryNumber] = useState(() => getEnquiryNumber());

  useEffect(() => {
    trackEvent("journey_completed", { journey: "personal-loan" });
    trackEvent("step_completed", { step: "personal-loan-complete" });

    const employeeId = prefilledData?.employeeId ?? formData?.employeeId;
    if (employeeId) {
      try {
        localStorage.setItem(
          `employeeJourneyStatus_${employeeId}`,
          JSON.stringify({
            status: "completed",
            currentStepTitle: "Enquiry Submitted",
            currentStepId: "personal-loan:complete",
            journeyType: "personal-loan",
            lastUpdated: new Date().toISOString(),
            enquiryNumber,
            ...formData,
          })
        );
      } catch {
        // ignore
      }
    }
  }, [enquiryNumber, prefilledData?.employeeId, formData]);

  return (
    <StepCard maxWidth="2xl">
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-[#111827] mb-2">
          Your enquiry has been captured successfully!
        </h1>
        <p className="text-slate-600 mb-1">
          Your enquiry number is <strong className="font-mono text-[#111827]">{enquiryNumber}</strong>
        </p>
        <p className="text-sm text-slate-500">
          Our team will get in touch with you shortly for the next steps.
        </p>
      </div>
    </StepCard>
  );
}
