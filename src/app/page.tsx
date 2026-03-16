"use client";

import { useJourney } from "@/app/context/JourneyContext";
import { STEP_COMPONENTS } from "@/app/context/stepDefinitions";
import JourneyStepWrapper from "@/app/components/JourneyStepWrapper";
import Dashboard from "@/app/components/Dashboard";
import AgentLayout from "@/app/components/layout/AgentLayout";
import { AnimatePresence } from "framer-motion";
import React, { useEffect, useRef } from "react";

export default function Home() {
  const {
    journeySteps,
    currentStepIndex,
    currentBranchComponent,
    showDashboard,
    isResumeFlow,
    resumeTargetStepIndex,
    startJourney,
  } = useJourney();

  const bootedRef = useRef(false);

  // If this tab was opened via Invite, read the pending invite and start the journey
  useEffect(() => {
    if (bootedRef.current) return;
    try {
      const raw = localStorage.getItem("pendingInvite");
      if (!raw) return;
      localStorage.removeItem("pendingInvite");
      bootedRef.current = true;
      const parsed = JSON.parse(raw);
      const { journeyType, prefilledData, employee } = parsed;
      // Merge HRMS prefilledData with employee so HRMS fields flow into the journey
      const merged = prefilledData
        ? { ...(employee || {}), ...prefilledData }
        : parsed.prefilled || {};
      startJourney(journeyType, merged);
    } catch { /* ignore */ }
  }, [startJourney]);

  const BranchComponent = currentBranchComponent;

  const showResumeScreen = !showDashboard && !BranchComponent && isResumeFlow &&
    currentStepIndex === 0 && resumeTargetStepIndex !== null && resumeTargetStepIndex > 0;

  const StepComponent = showResumeScreen
    ? STEP_COMPONENTS.resume
    : journeySteps[currentStepIndex]
      ? STEP_COMPONENTS[journeySteps[currentStepIndex].id]
      : null;

  if (showDashboard) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AgentLayout>
        <div className="w-full max-w-[1400px] mx-auto py-4 lg:py-8 px-2 sm:px-4">
          <AnimatePresence mode="wait">
            <JourneyStepWrapper key={BranchComponent ? "branch" : showResumeScreen ? "resume" : journeySteps[currentStepIndex]?.id || "current"}>
              {BranchComponent ? (
                <BranchComponent />
              ) : StepComponent ? (
                React.createElement(StepComponent)
              ) : null}
            </JourneyStepWrapper>
          </AnimatePresence>
        </div>
      </AgentLayout>
    </div>
  );
}
