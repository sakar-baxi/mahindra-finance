"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type PortalMode = "hr" | "rm" | "employee";

interface PortalContextType {
    portalMode: PortalMode;
    setPortalMode: (mode: PortalMode) => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

const PORTAL_LABELS: Record<PortalMode, string> = {
    hr: "HR Portal",
    rm: "RM Portal",
    employee: "Employee Portal",
};

export function PortalProvider({ children }: { children: ReactNode }) {
    const [portalMode, setPortalMode] = useState<PortalMode>("hr");
    return (
        <PortalContext.Provider value={{ portalMode, setPortalMode }}>
            {children}
        </PortalContext.Provider>
    );
}

export function usePortal() {
    const ctx = useContext(PortalContext);
    if (!ctx) throw new Error("usePortal must be used within PortalProvider");
    return ctx;
}

export { PORTAL_LABELS };
