"use client";

import React, { useEffect } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { useBranding } from "@/app/context/BrandingContext";
import { CheckCircle2, Video, ArrowRight } from "lucide-react";
import StepCard from "@/app/components/layout/StepCard";
import { Button } from "@/app/components/ui/button";

/**
 * Mahindra Finance step: Account opened confirmation BEFORE Video KYC.
 * Customer feels account is opened; Video KYC is required to activate and access it.
 * Enables fast account opening that can be completed in one sitting.
 */
export default function StepAccountOpened() {
    const { nextStep, setBottomBarContent } = useJourney();
    const { config } = useBranding();
    const bankName = config.name || "Mahindra Finance";

    useEffect(() => {
        setBottomBarContent(null);
    }, [setBottomBarContent]);

    return (
        <StepCard maxWidth="2xl">
            <div className="flex flex-col items-center text-center px-4 py-8 md:py-12">
                {/* Success icon */}
                <div
                    className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center shadow-lg mb-6"
                    style={{ backgroundColor: "var(--primary-bank)", color: "white" }}
                >
                    <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12" strokeWidth={2.5} />
                </div>

                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-100 mb-4">
                    Account opened
                </span>

                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-3">
                    Your {bankName} account is ready
                </h1>
                <p className="text-slate-600 text-base md:text-lg max-w-md leading-relaxed mb-2">
                    Congratulations! Your salary account has been opened. To activate and access it, complete a quick Video KYC verification.
                </p>
                <p className="text-slate-500 text-sm mb-8">
                    You can finish Video KYC now in one sitting—it only takes a couple of minutes.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                    <Button
                        className="flex-1 h-12 font-semibold text-base"
                        style={{ backgroundColor: "var(--primary-bank)", color: "white" }}
                        onClick={nextStep}
                    >
                        <Video className="w-5 h-5 mr-2" />
                        Continue to Video KYC
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>

                <p className="text-slate-400 text-xs mt-6">
                    Your account details will be shared once Video KYC is complete.
                </p>
            </div>
        </StepCard>
    );
}
