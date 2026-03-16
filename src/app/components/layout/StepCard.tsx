import React from "react";
import { cn } from "@/lib/utils";

interface StepCardProps {
    children: React.ReactNode;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
    step?: string;
    className?: string;
}

const MAX_WIDTH_CLASS: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-full",
};

export default function StepCard({ children, maxWidth = "6xl", step, className }: StepCardProps) {
    return (
        <div className={cn("w-full mx-auto", MAX_WIDTH_CLASS[maxWidth] || MAX_WIDTH_CLASS["6xl"])}>
            <div className={cn("enterprise-card w-full", className)}>
                {step && (
                    <div
                        className="step-progress-pill mb-5 inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
                        style={{ backgroundColor: "var(--primary-bank)", color: "white" }}
                        aria-label={`Current step: ${step}`}
                    >
                        {step}
                    </div>
                )}
                <div className="space-y-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
