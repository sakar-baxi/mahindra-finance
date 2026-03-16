"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type BankTheme = "mahindra" | "hdfc" | "icici" | "axis" | "idfc" | "custom";

export interface BankConfig {
    name: string;
    primary: string;
    secondary: string;
    accent: string;
    logo: string;
    logoUrl?: string; // custom uploaded logo data URL
    borderRadius: number; // in pixels
    fontFamily: "Open Sans" | "Inter" | "Poppins" | "Roboto" | "Plus Jakarta Sans";
    glassOpacity: number; // 0 to 1
    modules: {
        showBenefits: boolean;
        showSecurity: boolean;
        headerSize: "regular" | "large";
        inputStyle: "filled" | "outline";
    };
    preset: "glassy" | "neobrutalist" | "minimal";
}

const DEFAULT_CONFIGS: Record<Exclude<BankTheme, "custom">, BankConfig> = {
	mahindra: {
		name: "Mahindra Finance",
		primary: "#C41E3A",
		secondary: "#8B0000",
		accent: "#FFF5F5",
		logo: "mahindra",
		borderRadius: 8,
		fontFamily: "Plus Jakarta Sans",
		glassOpacity: 0.4,
		modules: {
			showBenefits: true,
			showSecurity: true,
			headerSize: "large",
			inputStyle: "filled",
		},
		preset: "minimal",
	},
	idfc: {
		name: "Mahindra Finance",
		primary: "#004C8F",
		secondary: "#0066AA",
		accent: "#f5f5f5",
		logo: "idfc",
		borderRadius: 8,
		fontFamily: "Plus Jakarta Sans",
		glassOpacity: 0.4,
		modules: {
			showBenefits: true,
			showSecurity: true,
			headerSize: "large",
			inputStyle: "filled",
		},
		preset: "minimal"
	},
	hdfc: {
        name: "Mahindra Finance",
        primary: "#004C8F",
        secondary: "#0066AA",
        accent: "#f5f5f5",
        logo: "hdfc",
        borderRadius: 8,
        fontFamily: "Open Sans",
        glassOpacity: 0.4,
        modules: {
            showBenefits: true,
            showSecurity: true,
            headerSize: "large",
            inputStyle: "filled",
        },
        preset: "glassy"
    },
    icici: {
        name: "ICICI Bank",
        primary: "#f27121",
        secondary: "#9b1c1c",
        accent: "#fffaf0",
        logo: "I",
        borderRadius: 24,
        fontFamily: "Open Sans",
        glassOpacity: 0.5,
        modules: {
            showBenefits: true,
            showSecurity: true,
            headerSize: "regular",
            inputStyle: "filled",
        },
        preset: "minimal"
    },
    axis: {
        name: "Axis Bank",
        primary: "#971237",
        secondary: "#f5f5f5",
        accent: "#fff5f7",
        logo: "A",
        borderRadius: 12,
        fontFamily: "Open Sans",
        glassOpacity: 0.3,
        modules: {
            showBenefits: false,
            showSecurity: true,
            headerSize: "regular",
            inputStyle: "filled",
        },
        preset: "glassy"
    },
};

interface BrandingContextType {
    theme: BankTheme;
    config: BankConfig;
    setTheme: (theme: BankTheme) => void;
    updateConfig: (updates: Partial<BankConfig>) => void;
    toggleTheme: () => void;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<BankTheme>("mahindra");
	const [config, setConfig] = useState<BankConfig>(DEFAULT_CONFIGS.mahindra);

    const setTheme = (newTheme: BankTheme) => {
        setThemeState(newTheme);
        if (newTheme !== "custom") {
            setConfig(DEFAULT_CONFIGS[newTheme]);
        }
    };

    const updateConfig = (updates: Partial<BankConfig>) => {
        setThemeState("custom");
        setConfig(prev => ({ ...prev, ...updates }));
    };

    const toggleTheme = () => {
        const themes: BankTheme[] = ["mahindra", "hdfc", "icici", "axis", "idfc"];
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    // Global style application
    useEffect(() => {
        const root = document.documentElement;

        // Primary (Mahindra Finance: #004C8F)
        root.style.setProperty('--primary-bank', config.primary);

        // Darker hover state (Mahindra Finance guidance: a bit darker)
        const primaryDark =
            theme === "mahindra"
                ? "#9B1529"
                : theme === "hdfc"
                ? "#003366"
                : theme === "idfc"
                ? "#003366"
                : config.primary; // safe fallback if theme changes
        root.style.setProperty('--primary-bank-dark', primaryDark);

        // Accent/secondary (Mahindra Finance: blue)
        root.style.setProperty('--secondary-bank', config.secondary);

        // 4px / 8px radius system (buttons/inputs vs cards)
        root.style.setProperty('--radius-bank', `${config.borderRadius}px`);
        const fontVarMap: Record<string, string> = {
            "Open Sans": "var(--font-open-sans)",
            "Inter": "var(--font-inter)",
            "Poppins": "var(--font-poppins)",
            "Roboto": "var(--font-roboto)",
            "Plus Jakarta Sans": "var(--font-sans)",
        };
        root.style.setProperty('--font-bank', fontVarMap[config.fontFamily] || config.fontFamily);
    }, [config, theme]);

    return (
        <BrandingContext.Provider value={{ theme, config, setTheme, updateConfig, toggleTheme }}>
            <div style={{ fontFamily: config.fontFamily }}>
                {children}
            </div>
        </BrandingContext.Provider>
    );
}

export function useBranding() {
    const context = useContext(BrandingContext);
    if (context === undefined) {
        throw new Error("useBranding must be used within a BrandingProvider");
    }
    return context;
}
