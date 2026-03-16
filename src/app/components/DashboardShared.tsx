import React from "react";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export function getJourneyCategory(journey: string): { label: "NTB" | "ETB: Auto Conv." | "ETB with KYC" | "NTB - Alternate"; className: string } {
    switch (journey) {
        case "ntb":
            return { label: "NTB", className: "bg-dashboard-primary-light text-dashboard-primary border border-dashboard-primary/30" };
        case "ntb-no-parents":
            return { label: "NTB - Alternate", className: "bg-dashboard-primary-light text-dashboard-primary border border-dashboard-primary/30" };
        case "etb":
            return { label: "ETB: Auto Conv.", className: "bg-slate-50 text-slate-700 border border-slate-200" };
        case "etb-nk":
        default:
            return { label: "ETB with KYC", className: "bg-dashboard-primary-light text-dashboard-primary border border-dashboard-primary/30" };
    }
}

export interface JourneyStatus {
    status?: "in_progress" | "completed";
    currentStepTitle?: string;
}

export function getStatusBadge(empId: string, invited: boolean, statuses: Record<string, JourneyStatus>) {
    const status = statuses[empId];
    if (status?.status === "completed") {
        return { label: "Completed", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" };
    }
    if (status?.status === "in_progress") {
        return { label: status.currentStepTitle || "In Progress", className: "bg-dashboard-primary-light text-dashboard-primary border border-dashboard-primary/30" };
    }
    if (invited) {
        return { label: "Invited", className: "bg-amber-50 text-amber-700 border border-amber-200" };
    }
    return { label: "Not Started", className: "bg-slate-100 text-slate-600 border border-slate-200" };
}

const STAT_CARD_STYLES = {
    blue: { text: "text-[#0066CC]", iconBg: "bg-[#E6F2FF]", iconColor: "text-[#0066CC]" },
    yellow: { text: "text-[#B45309]", iconBg: "bg-[#FEF3C7]", iconColor: "text-[#D97706]" },
    red: { text: "text-[#DC2626]", iconBg: "bg-[#FEE2E2]", iconColor: "text-[#DC2626]" },
    green: { text: "text-[#059669]", iconBg: "bg-[#D1FAE5]", iconColor: "text-[#059669]" },
    purple: { text: "text-[#7C3AED]", iconBg: "bg-[#EDE9FE]", iconColor: "text-[#7C3AED]" },
    orange: { text: "text-[#EA580C]", iconBg: "bg-[#FFEDD5]", iconColor: "text-[#EA580C]" },
    grey: { text: "text-[#4B5563]", iconBg: "bg-[#F3F4F6]", iconColor: "text-[#6B7280]" },
} as const;

export function StatCard({
    label,
    value,
    subtitle,
    icon,
    color,
}: {
    label: string;
    value: number;
    subtitle?: string;
    icon: React.ReactNode;
    color: "blue" | "yellow" | "red" | "green" | "purple" | "orange" | "grey";
}) {
    const s = STAT_CARD_STYLES[color];
    return (
        <div className="bg-white border border-[#E8EAED] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">{label}</span>
                    <div className={cn("text-2xl font-bold mt-1", s.text)}>{value}</div>
                    {subtitle && <p className="text-xs text-[#9CA3AF] mt-0.5">{subtitle}</p>}
                </div>
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0", s.iconBg, s.iconColor)}>{icon}</div>
            </div>
        </div>
    );
}

export function HeaderCell({ label, hasFilter, className }: { label: string; hasFilter?: boolean; className?: string }) {
    return (
        <th className={cn("px-5 py-4 text-left font-semibold text-[#374151] whitespace-nowrap text-xs uppercase tracking-wide", className)}>
            <div className="flex items-center gap-2">
                {label}
                {hasFilter && <Filter className="w-3.5 h-3.5" />}
            </div>
        </th>
    );
}
