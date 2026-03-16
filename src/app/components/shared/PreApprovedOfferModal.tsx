"use client";

import React, { useState } from "react";
import { LucideIcon, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";

export interface Offer {
    id: string;
    icon: LucideIcon;
    title: string;
    desc: string;
    highlight: string;
    gradient: string;
    applyLabel?: string;
}

interface PreApprovedOfferModalProps {
    offer: Offer | null;
    onClose: () => void;
}

export function PreApprovedOfferModal({ offer, onClose }: PreApprovedOfferModalProps) {
    const [step, setStep] = useState<"form" | "success">("form");
    const [loanAmount, setLoanAmount] = useState("");
    const [tenure, setTenure] = useState("");

    if (!offer) return null;

    const Icon = offer.icon;
    const isLoan = offer.id === "personal-loan" || offer.id === "home-loan";

    const handleApply = (e: React.FormEvent) => {
        e.preventDefault();
        setStep("success");
    };

    const handleClose = () => {
        setStep("form");
        setLoanAmount("");
        setTenure("");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={handleClose}>
            <div
                className={cn(
                    "relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden",
                    "animate-in fade-in zoom-in-95 duration-200"
                )}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 text-slate-500 z-10"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                {step === "form" ? (
                    <>
                        <div className={cn("p-6 pb-4", `bg-gradient-to-br ${offer.gradient}`, "text-white")}>
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                                <Icon className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold">{offer.title}</h2>
                            <p className="text-white/90 text-sm mt-1">{offer.desc}</p>
                        </div>
                        <form onSubmit={handleApply} className="p-6 pt-4 space-y-4">
                            {isLoan ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Loan amount (₹)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 500000"
                                            value={loanAmount}
                                            onChange={(e) => setLoanAmount(e.target.value.replace(/\D/g, ""))}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Tenure (months)</label>
                                        <select
                                            value={tenure}
                                            onChange={(e) => setTenure(e.target.value)}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900"
                                        >
                                            <option value="">Select</option>
                                            <option value="12">12 months</option>
                                            <option value="24">24 months</option>
                                            <option value="36">36 months</option>
                                            <option value="48">48 months</option>
                                            <option value="60">60 months</option>
                                        </select>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-slate-600">You’re pre-approved for this offer. Apply to activate.</p>
                            )}
                            <Button
                                type="submit"
                                className="w-full h-12 font-semibold rounded-xl"
                                style={{ backgroundColor: "var(--primary-bank)", color: "white" }}
                            >
                                {offer.applyLabel || "Apply now"}
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Application submitted</h3>
                        <p className="text-slate-600 text-sm mt-2">
                            We’ll process your {offer.title} application and contact you within 24–48 hours.
                        </p>
                        <Button
                            onClick={handleClose}
                            className="mt-6 w-full h-11 font-semibold rounded-xl"
                            style={{ backgroundColor: "var(--primary-bank)", color: "white" }}
                        >
                            Done
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
