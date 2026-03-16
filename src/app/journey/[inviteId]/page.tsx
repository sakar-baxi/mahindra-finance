"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AgentLayout from "@/app/components/layout/AgentLayout";
import JourneyStepWrapper from "@/app/components/JourneyStepWrapper";
import { STEP_COMPONENTS } from "@/app/context/stepDefinitions";
import { useJourney } from "@/app/context/JourneyContext";
import StepError from "@/app/components/steps/StepError";
import { AnimatePresence } from "framer-motion";

export default function JourneyInvitePage() {
  const router = useRouter();
  const params = useParams<{ inviteId: string }>();
  const inviteId = useMemo(() => params.inviteId, [params.inviteId]);

  const {
    journeySteps,
    currentStepIndex,
    currentBranchComponent,
    startJourney,
  } = useJourney();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<{ title: string; message: string } | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!inviteId || startedRef.current) return;

    try {
      const raw = localStorage.getItem("pendingInvite");
      if (!raw) {
        setLoadError({
          title: "No invite data found",
          message: "Please go back to the dashboard and click Invite again.",
        });
        setIsLoading(false);
        return;
      }

      const invite = JSON.parse(raw) as {
        journeyType: "ntb" | "ntb-conversion" | "etb-nk" | "etb" | "personal-loan";
        employee?: { id: string; name: string; email: string; phone?: string };
        prefilledData?: Record<string, unknown>;
      };

      localStorage.removeItem("pendingInvite");
      startedRef.current = true;

      const prefilled = invite.employee
        ? {
            employeeId: invite.employee.id,
            name: invite.employee.name,
            email: invite.employee.email,
            mobileNumber: invite.employee.phone,
            phone: invite.employee.phone,
            ...(invite.prefilledData || {}),
          }
        : { ...(invite.prefilledData || {}) };

      startJourney(invite.journeyType, prefilled);
    } catch {
      setLoadError({
        title: "Something went wrong",
        message: "Unable to start the journey. Please try again from the dashboard.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [inviteId, startJourney]);

  const BranchComponent = currentBranchComponent;

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <AgentLayout>
          <div className="w-full max-w-[1400px] mx-auto py-4 lg:py-8 px-2 sm:px-4">
            <StepError
              title={loadError.title}
              message={loadError.message}
              onBackToHome={() => router.push("/")}
            />
          </div>
        </AgentLayout>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <AgentLayout>
          <div className="w-full max-w-[1400px] mx-auto py-10 lg:py-16 px-2 sm:px-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-10 text-center">
              <p className="text-slate-600 font-semibold">Starting your journey…</p>
            </div>
          </div>
        </AgentLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AgentLayout>
        <div className="w-full max-w-[1400px] mx-auto py-4 lg:py-8 px-2 sm:px-4">
          <AnimatePresence mode="wait">
            <JourneyStepWrapper
              key={BranchComponent ? "branch" : journeySteps[currentStepIndex]?.id || "current"}
            >
              {BranchComponent ? (
                <BranchComponent />
              ) : (
                journeySteps[currentStepIndex]
                  ? React.createElement(STEP_COMPONENTS[journeySteps[currentStepIndex].id])
                  : null
              )}
            </JourneyStepWrapper>
          </AnimatePresence>
        </div>
      </AgentLayout>
    </div>
  );
}
