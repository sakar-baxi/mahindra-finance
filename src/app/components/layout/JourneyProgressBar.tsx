"use client";

import React, { useMemo } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { useBranding } from "@/app/context/BrandingContext";

export default function JourneyProgressBar() {
  const { journeySteps, currentStepIndex } = useJourney();
  const { config } = useBranding();

  const total = journeySteps.length;
  const progress = useMemo(() => {
    if (!total) return 0;
    return Math.min(100, Math.max(0, ((currentStepIndex + 1) / total) * 100));
  }, [currentStepIndex, total]);

  if (!total) return null;

  const current = currentStepIndex + 1;

  return (
    <div className="w-full flex items-center gap-3">
      {/* Step badge - prominent pill */}
      <div
        className="shrink-0 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
        style={{ backgroundColor: config.primary }}
      >
        {current} of {total}
      </div>
      {/* Progress bar */}
      <div className="flex-1 min-w-0 h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, backgroundColor: config.primary }}
        />
      </div>
    </div>
  );
}
