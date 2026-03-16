"use client";

import React from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { CreditCard, PiggyBank, ChevronRight, Wallet, Car, Home, TrendingUp, Bell, FileText, X } from "lucide-react";
import ProductMarketplaceDashboard, { openPersonalLoanJourneyInNewTab } from "@/app/components/shared/ProductMarketplaceDashboard";
import { getCurrentEmployeeIdFromJourney, getBreOffersForEmployee, getNudge, clearNudge, type EmployeeOfferProfile, type NudgePayload } from "@/lib/hrmsSync";

type EmpPageKey = "dashboard" | "finagent" | "orders";

interface EmployeePortalContentProps {
    activePage: EmpPageKey;
    onNavigate: (page: EmpPageKey) => void;
    /** When in employee portal, which employee is "logged in" (from dropdown). */
    currentEmployeeId?: string | null;
    /** Full employee for offer computation (salary, grade) and nudge resume. */
    currentEmployee?: EmployeeOfferProfile & { id: string; name?: string; email?: string; phone?: string } | null;
    /** Called when employee clicks Resume/Update docs from nudge notification. */
    onResumeFromNudge?: (emp: EmployeeOfferProfile & { id: string; name?: string; email?: string; phone?: string }, startStepId?: string | null) => void;
}

export default function EmployeePortalContent({ activePage, onNavigate, currentEmployeeId, currentEmployee, onResumeFromNudge }: EmployeePortalContentProps) {
    const { formData } = useJourney();
    const userName = formData?.name?.split?.(" ")[0] || "Rahul";

    const employeeIdForDashboard = currentEmployeeId ?? getCurrentEmployeeIdFromJourney();
    const [nudge, setNudge] = React.useState<NudgePayload | null>(() => (employeeIdForDashboard ? getNudge(employeeIdForDashboard) : null));
    React.useEffect(() => {
        setNudge(employeeIdForDashboard ? getNudge(employeeIdForDashboard) : null);
    }, [employeeIdForDashboard]);

    // Mock application status from localStorage
    const [appStatus, setAppStatus] = React.useState<"none" | "in_progress" | "completed">("none");
    React.useEffect(() => {
        try {
            const keys = Object.keys(localStorage).filter((k) => k.startsWith("employeeJourneyStatus_"));
            if (keys.some((k) => JSON.parse(localStorage.getItem(k) || "{}").status === "completed")) {
                setAppStatus("completed");
            } else if (keys.some((k) => JSON.parse(localStorage.getItem(k) || "{}").status === "in_progress")) {
                setAppStatus("in_progress");
            }
        } catch { /* ignore */ }
    }, []);

    if (activePage === "dashboard") {
        const employeeId = employeeIdForDashboard;
        const breOffers = employeeId ? getBreOffersForEmployee(employeeId, currentEmployee ?? undefined) : null;
        const hasOffers = breOffers && (breOffers.topUpEligible || breOffers.carLoanEligible || breOffers.homeLoanEligible);

        return (
            <div className="space-y-6">
                {nudge && currentEmployee && onResumeFromNudge && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                <Bell className="w-5 h-5 text-amber-700" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-amber-900">Reminder from your RM</h3>
                                <p className="text-sm text-amber-800 mt-0.5">{nudge.message ?? "Your RM has asked you to complete your application and submit any pending documents."}</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <button
                                        type="button"
                                        onClick={() => onResumeFromNudge(currentEmployee, nudge.startStepId)}
                                        className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold bg-dashboard-primary text-white hover:opacity-90"
                                    >
                                        Resume journey
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onResumeFromNudge(currentEmployee, "personal-loan:documentCollection")}
                                        className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold border border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
                                    >
                                        <FileText className="w-4 h-4" />
                                        Update documents
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { if (employeeId) clearNudge(employeeId); setNudge(null); }}
                                        className="inline-flex items-center gap-2 h-9 px-3 rounded-lg text-sm text-amber-700 hover:bg-amber-100"
                                    >
                                        <X className="w-4 h-4" />
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {hasOffers && (
                            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
                                <h2 className="text-sm font-semibold text-[#111827] mb-3">New Offers for you</h2>
                                <div className="flex flex-wrap gap-3">
                                    {breOffers.topUpEligible && breOffers.topUpAmount && (
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 min-w-[200px]">
                                            <TrendingUp className="w-8 h-8 text-emerald-600 shrink-0" />
                                            <div>
                                                <p className="font-semibold text-[#111827]">Top-up eligible</p>
                                                <p className="text-sm text-[#6B7280]">Up to ₹{(breOffers.topUpAmount / 100000).toFixed(1)}L</p>
                                            </div>
                                        </div>
                                    )}
                                    {breOffers.carLoanEligible && (
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-[#E5E7EB] min-w-[200px]">
                                            <Car className="w-8 h-8 text-dashboard-primary shrink-0" />
                                            <div>
                                                <p className="font-semibold text-[#111827]">Car Loan</p>
                                                <p className="text-sm text-[#6B7280]">Eligible</p>
                                            </div>
                                        </div>
                                    )}
                                    {breOffers.homeLoanEligible && (
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-[#E5E7EB] min-w-[200px]">
                                            <Home className="w-8 h-8 text-dashboard-primary shrink-0" />
                                            <div>
                                                <p className="font-semibold text-[#111827]">Home Loan</p>
                                                <p className="text-sm text-[#6B7280]">Eligible</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {breOffers.updatedTerms && <p className="text-xs text-[#6B7280] mt-2">{breOffers.updatedTerms}</p>}
                            </div>
                )}
                <ProductMarketplaceDashboard
                    showHero
                    userName={userName}
                    onViewAllOffers={() => onNavigate("orders")}
                />
            </div>
        );
    }

    if (activePage === "finagent") {
        return (
            <div className="max-w-2xl">
                <h1 className="text-2xl font-bold text-[#111827]">FinAgent</h1>
                <p className="text-sm text-[#6B7280] mt-1 mb-6">AI-powered financial assistant</p>
                <div className="rounded-xl border border-[#E8EAED] bg-white p-8 text-center">
                    <PiggyBank className="w-12 h-12 text-dashboard-primary mx-auto mb-4" />
                    <p className="text-[#6B7280] mb-6">Get instant answers about your personal loan, offers, and more.</p>
                    <button
                        onClick={() => openPersonalLoanJourneyInNewTab()}
                        className="h-12 px-6 bg-dashboard-primary text-white font-semibold rounded-xl hover:opacity-90"
                    >
                        Apply for Personal Loan
                    </button>
                </div>
            </div>
        );
    }

    if (activePage === "orders") {
        return (
            <div className="max-w-2xl">
                <h1 className="text-2xl font-bold text-[#111827]">My Orders</h1>
                <p className="text-sm text-[#6B7280] mt-1 mb-6">Track your applications and orders</p>
                <div className="rounded-xl border border-[#E8EAED] bg-white p-8">
                    {appStatus === "none" && (
                        <p className="text-[#6B7280] text-center py-8">
                            No applications yet.{" "}
                            <button onClick={() => openPersonalLoanJourneyInNewTab()} className="text-dashboard-primary font-semibold hover:underline">
                                Apply for Personal Loan
                            </button>
                        </p>
                    )}
                    {appStatus === "in_progress" && (
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                            <PiggyBank className="w-10 h-10 text-amber-600" />
                            <div className="flex-1">
                                <p className="font-semibold text-[#111827]">Personal Loan - In Progress</p>
                                <p className="text-sm text-[#6B7280]">Complete your application</p>
                            </div>
                            <button onClick={() => openPersonalLoanJourneyInNewTab()} className="h-9 px-4 bg-dashboard-primary text-white text-sm font-semibold rounded-lg">
                                Continue
                            </button>
                        </div>
                    )}
                    {appStatus === "completed" && (
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                            <PiggyBank className="w-10 h-10 text-emerald-600" />
                            <div>
                                <p className="font-semibold text-[#111827]">Personal Loan - Enquiry Submitted</p>
                                <p className="text-sm text-[#6B7280]">We will get in touch shortly</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return null;
}
