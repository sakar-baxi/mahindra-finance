"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import StepError from "./steps/StepError";
import StepErrorBoundary from "./StepErrorBoundary";

interface Props {
  children: React.ReactNode;
}

export default function JourneyStepWrapper({ children }: Props) {
  const { error, currentStepIndex } = useJourney();
  const containerRef = useRef<HTMLDivElement>(null);
  const [reduceMotion] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  // Focus first focusable element on step change for screen readers
  useEffect(() => {
    if (error) return;
    const timer = setTimeout(() => {
      const first = containerRef.current?.querySelector<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])"
      );
      first?.focus({ preventScroll: true });
    }, 350);
    return () => clearTimeout(timer);
  }, [currentStepIndex, error]);

  return (
    <StepErrorBoundary>
      <motion.div
        ref={containerRef}
        className="w-full h-full min-h-0 flex flex-col"
        tabIndex={-1}
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
        transition={{
          duration: reduceMotion ? 0.15 : 0.3,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        {error ? (
          <StepError
            title={error.title}
            message={error.message}
          />
        ) : (
          children
        )}
      </motion.div>
    </StepErrorBoundary>
  );
}