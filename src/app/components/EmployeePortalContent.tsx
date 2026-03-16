"use client";

import React from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { CreditCard, PiggyBank, ChevronRight, Wallet } from "lucide-react";
import ProductMarketplaceDashboard, { openPersonalLoanJourneyInNewTab } from "@/app/components/shared/ProductMarketplaceDashboard";

type EmpPageKey = "dashboard" | "finagent" | "orders";

interface EmployeePortalContentProps {
    activePage: EmpPageKey;
    onNavigate: (page: EmpPageKey) => void;
}

export default function EmployeePortalContent({ activePage, onNavigate }: EmployeePortalContentProps) {
    const { formData } = useJourney();
    const userName = formData?.name?.split?.(" ")[0] || "Rahul";

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
        return (
            <ProductMarketplaceDashboard
                showHero
                userName={userName}
                onViewAllOffers={() => onNavigate("orders")}
            />
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
