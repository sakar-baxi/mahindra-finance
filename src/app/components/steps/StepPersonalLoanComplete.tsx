"use client";

import React, { useEffect, useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import StepCard from "@/app/components/layout/StepCard";
import { Button } from "@/app/components/ui/button";
import { CheckCircle2, Building2, Hash, Code, MapPin } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export default function StepPersonalLoanComplete() {
  const { formData, prefilledData } = useJourney();
  const [disbursalConfirmed, setDisbursalConfirmed] = useState<boolean | null>(null);

  const bankName = formData.bankName ?? prefilledData?.bankName ?? "";
  const bankAccountNumber = formData.bankAccountNumber ?? prefilledData?.bankAccountNumber ?? "";
  const bankIfscCode = formData.bankIfscCode ?? prefilledData?.bankIfscCode ?? "";
  const bankBranch = formData.bankBranch ?? prefilledData?.bankBranch ?? "";
  const hasBankDetails = !!(bankName && bankAccountNumber && bankIfscCode);

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
            currentStepTitle: "Ready for disbursal",
            currentStepId: "personal-loan:complete",
            journeyType: "personal-loan",
            lastUpdated: new Date().toISOString(),
            disbursalConfirmed: disbursalConfirmed ?? undefined,
            ...formData,
          })
        );
      } catch {
        // ignore
      }
    }
  }, [disbursalConfirmed, prefilledData?.employeeId, formData]);

  return (
    <StepCard maxWidth="2xl">
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-[#111827] mb-2">
          Your loan is ready for disbursal
        </h1>
        <p className="text-slate-600 mb-8">
          Your application has been approved. Confirm your bank account for disbursal.
        </p>

        {hasBankDetails && (
          <div className="w-full max-w-md text-left mb-8">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Bank account from HRMS
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Bank name</p>
                    <p className="font-medium text-slate-900">{bankName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Hash className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Account number</p>
                    <p className="font-mono font-medium text-slate-900">
                      {bankAccountNumber.replace(/(\d{4})(?=\d)/g, "$1 ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Code className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">IFSC</p>
                    <p className="font-mono font-medium text-slate-900">{bankIfscCode}</p>
                  </div>
                </div>
                {bankBranch && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Branch</p>
                      <p className="font-medium text-slate-900">{bankBranch}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="text-slate-700 font-medium mb-4">
              Do you want the disbursal in the mentioned bank account?
            </p>

            {disbursalConfirmed === null ? (
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() => setDisbursalConfirmed(true)}
                  className="bg-dashboard-primary hover:bg-dashboard-primary-dark text-white"
                >
                  Yes, disburse to this account
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDisbursalConfirmed(false)}
                  className="border-slate-300"
                >
                  No, I'll use a different account
                </Button>
              </div>
            ) : disbursalConfirmed ? (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
                Disbursal will be credited to the account shown above. You will receive a confirmation once the transfer is initiated.
              </div>
            ) : (
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                Please contact our team or visit the branch to update your bank account details for disbursal.
              </div>
            )}
          </div>
        )}

        {!hasBankDetails && (
          <p className="text-slate-600 text-sm">
            Bank account details were not found in your HRMS record. Please contact our team to provide your bank account for disbursal.
          </p>
        )}
      </div>
    </StepCard>
  );
}
