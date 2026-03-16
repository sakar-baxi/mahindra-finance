"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Users, Building2, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePortal, PortalMode, PORTAL_LABELS } from "@/app/context/PortalContext";

const PORTAL_ICONS: Record<PortalMode, React.ComponentType<{ className?: string }>> = {
    hr: Users,
    rm: Building2,
    employee: UserCircle,
};

export default function ProfileSwitcher() {
    const { portalMode, setPortalMode } = usePortal();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    const Icon = PORTAL_ICONS[portalMode];

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors w-full",
                    "border-[#E5E7EB] bg-[#F9FAFB] hover:bg-white hover:border-[#E5E7EB]",
                    "text-sm font-semibold text-[#111827]"
                )}
            >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <Icon className="w-4 h-4 text-dashboard-primary shrink-0" />
                <span className="truncate">{PORTAL_LABELS[portalMode]}</span>
                <ChevronDown className={cn("w-4 h-4 text-[#9CA3AF] shrink-0 transition-transform", open && "rotate-180")} />
            </button>
            {open && (
                <div className="absolute left-0 top-full mt-2 w-full min-w-[160px] py-2 bg-white border border-[#E5E7EB] rounded-xl shadow-xl z-50">
                    {(["hr", "rm", "employee"] as const).map((mode) => {
                        const MIcon = PORTAL_ICONS[mode];
                        return (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => {
                                    setPortalMode(mode);
                                    setOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors rounded-lg mx-1",
                                    portalMode === mode
                                        ? "bg-[#E6F2FF] text-[#0066CC] font-semibold"
                                        : "text-[#374151] hover:bg-[#F9FAFB]"
                                )}
                            >
                                <MIcon className="w-4 h-4 shrink-0" />
                                {PORTAL_LABELS[mode]}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
