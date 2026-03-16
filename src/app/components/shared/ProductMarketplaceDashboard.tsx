"use client";

import React, { useState } from "react";
import {
    CreditCard,
    PiggyBank,
    Zap,
    ChevronRight,
    Wallet,
    Building2,
    TrendingUp,
    Shield,
    Landmark,
    FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Opens personal loan journey in a new tab (Mahindra Finance) */
export function openPersonalLoanJourneyInNewTab(prefilled?: Record<string, unknown>) {
    try {
        localStorage.setItem(
            "pendingInvite",
            JSON.stringify({ journeyType: "personal-loan", prefilled: prefilled || {} })
        );
        window.open("/", "_blank");
    } catch {
        window.open("/", "_blank");
    }
}

/** @deprecated Use openPersonalLoanJourneyInNewTab for employee portal */
export function openSalaryJourneyInNewTab(prefilled?: Record<string, unknown>) {
    openPersonalLoanJourneyInNewTab(prefilled);
}

interface ProductMarketplaceDashboardProps {
    /** Show the dark hero section (Welcome back, product offers) */
    showHero?: boolean;
    /** User's first name for greeting */
    userName?: string;
    /** Callback when "View all" is clicked (e.g. navigate to orders) */
    onViewAllOffers?: () => void;
}

const FEATURED_PRODUCTS = [
    { icon: PiggyBank, tag: "PRE-APPROVED", title: "Mahindra Finance Personal Loan", desc: "From unexpected expenses to big dreams, our Personal Loans have got you covered.", benefit: "Up to ₹15L", isPrimary: true },
    { icon: CreditCard, tag: "OFFER", title: "Vehicle Loan", desc: "Tractor, car, commercial vehicle and three-wheeler financing.", benefit: "Flexible tenure", isPrimary: false },
    { icon: Wallet, tag: "OFFER", title: "Fixed Deposits & Mutual Funds", desc: "Grow your savings with competitive returns.", benefit: "Secure returns", isPrimary: false },
];

const MARKETPLACE_CATEGORIES = [
    { id: "all", label: "All Products", icon: Building2 },
    { id: "deposits", label: "Deposits", icon: Landmark },
    { id: "cards", label: "Cards", icon: CreditCard },
    { id: "loans", label: "Loans", icon: PiggyBank },
    { id: "investments", label: "Investments", icon: TrendingUp },
    { id: "insurance", label: "Insurance", icon: Shield },
] as const;

const MARKETPLACE_PRODUCTS = [
    { id: "fd", category: "deposits", tag: "SECURE", title: "Fixed & Recurring Deposits", desc: "Grow savings with high interest rates (up to 7.40% p.a.) or start small with systematic...", highlight: "Up to 7.40% p.a.", icon: Landmark },
    { id: "cc", category: "cards", tag: "REWARDS", title: "Mahindra Finance Credit Cards", desc: "Reward-focused credit cards with exclusive dining and travel offers.", highlight: "Lifetime Free Options", icon: CreditCard },
    { id: "pl", category: "loans", tag: "FAST", title: "Mahindra Finance Personal Loan", desc: "Quick personal loans with minimal documentation for your needs.", highlight: "Instant Approval", icon: FileText },
    { id: "demat", category: "investments", tag: "TRADING", title: "Demat & Trading", desc: "Seamless trading with leading partners. Zero brokerage offers on intraday.", highlight: "Zero Brokerage", icon: TrendingUp },
    { id: "nps", category: "investments", tag: "RETIREMENT", title: "Corporate NPS", desc: "Secure your retirement with National Pension System corporate benefits.", highlight: "Tax Benefits", icon: Building2 },
    { id: "life", category: "insurance", tag: "PROTECTION", title: "Life Insurance", desc: "Comprehensive life coverage to secure your family's future.", highlight: "High Coverage", icon: Shield },
];

export default function ProductMarketplaceDashboard({
    showHero = true,
    userName = "Rahul",
    onViewAllOffers,
}: ProductMarketplaceDashboardProps) {
    const [activeCategory, setActiveCategory] = useState<string>("all");

    const filteredProducts =
        activeCategory === "all"
            ? MARKETPLACE_PRODUCTS
            : MARKETPLACE_PRODUCTS.filter((p) => p.category === activeCategory);

    return (
        <div className="w-full min-h-full flex flex-col">
            {showHero && (
                <div className="rounded-2xl mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 px-8 py-12 md:py-16 lg:min-h-[340px] text-white shadow-lg" style={{ background: "linear-gradient(135deg, #C41E3A 0%, #9B1529 45%, #8B0000 100%)" }}>
                    <div className="flex-1 min-w-0">
                        <p className="text-white/90 text-base mb-1">Welcome back, {userName} 👋</p>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                            From unexpected expenses to big dreams, our <span className="text-white/95">Personal Loans</span> have got you covered.
                        </h1>
                        <p className="text-white/80 text-base md:text-lg max-w-xl mb-6">
                            Quick, paperless personal loans for salaried employees with minimal documentation.
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mb-6 lg:mb-8">
                            <button
                                onClick={() => openPersonalLoanJourneyInNewTab()}
                                className="inline-flex items-center gap-2 h-12 px-6 bg-white text-[#C41E3A] hover:bg-white/90 font-semibold rounded-xl transition-colors"
                            >
                                Apply Now →
                            </button>
                            <span className="text-white/90 text-sm font-medium">⚡ QUICK APPROVAL</span>
                        </div>
                        <div className="flex flex-wrap gap-6">
                            {[
                                { icon: PiggyBank, label: "Up to ₹15L", sub: "Competitive rates" },
                                { icon: Wallet, label: "Minimal docs", sub: "Paperless process" },
                                { icon: CreditCard, label: "Flexible tenure", sub: "Easy EMIs" },
                            ].map(({ icon: Icon, label, sub }) => (
                                <div key={label} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center shrink-0">
                                        <Icon className="w-5 h-5 text-[#A5D6FA]" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">{label}</p>
                                        <p className="text-sm text-white/70">{sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex-shrink-0 flex justify-center lg:justify-end">
                        <div className="w-56 h-36 rounded-xl border border-white/10 shadow-2xl p-4 flex flex-col justify-between" style={{ background: "linear-gradient(to bottom right, #9B1529, #8B0000)" }}>
                            <div className="flex justify-between items-start">
                                <span className="text-white/60 text-xs font-mono">Mahindra Finance</span>
                            </div>
                            <div>
                                <p className="text-white/80 text-[10px] uppercase tracking-wider">Personal Loan</p>
                                <p className="text-white font-semibold text-sm">Apply in minutes</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Featured / Pre-approved Offers */}
            <div className="bg-white rounded-2xl border border-[#E8EAED] p-6 md:p-8 shadow-sm mb-8">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-[#111827]">Pre-approved Offers</h2>
                        <p className="text-sm text-[#6B7280] mt-0.5">Exclusive deals tailored for you</p>
                    </div>
                    {onViewAllOffers && (
                        <button
                            onClick={onViewAllOffers}
                            className="text-dashboard-primary font-semibold text-sm hover:underline flex items-center gap-1"
                        >
                            View all <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {FEATURED_PRODUCTS.map(({ icon: Icon, tag, title, desc, benefit, isPrimary }) => (
                        <div
                            key={title}
                            className={cn("p-5 rounded-xl border border-[#E8EAED] bg-[#F9FAFB] hover:border-dashboard-primary/30 transition-colors")}
                        >
                            <div className="w-12 h-10 rounded-lg flex items-center justify-center mb-3 bg-dashboard-primary/10">
                                <Icon className="w-6 h-6 text-dashboard-primary" />
                            </div>
                            <span className="text-[10px] font-bold text-dashboard-primary uppercase tracking-wider">{tag}</span>
                            <h3 className="font-bold text-[#111827] mt-1">{title}</h3>
                            <p className="text-sm text-[#6B7280] mt-1">{desc}</p>
                            <p className="text-sm font-semibold text-dashboard-primary mt-2">{benefit}</p>
                            <button
                                onClick={() => openPersonalLoanJourneyInNewTab()}
                                className="mt-4 w-full h-10 px-4 bg-dashboard-primary hover:opacity-90 text-white font-medium text-sm rounded-lg transition-colors"
                            >
                                Apply Now
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Product Marketplace */}
            <div className="bg-white rounded-2xl border border-[#E8EAED] p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-[#111827]">Product Marketplace</h2>
                <p className="text-sm text-[#6B7280] mt-0.5 mb-6">Explore financial products & services tailored for you</p>
                <div className="flex flex-wrap gap-2 mb-6">
                    {MARKETPLACE_CATEGORIES.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveCategory(id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                activeCategory === id
                                    ? "bg-dashboard-primary text-white"
                                    : "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredProducts.map(({ tag, title, desc, highlight, icon: Icon }) => (
                        <div
                            key={title}
                            className="p-5 rounded-xl border border-[#E8EAED] bg-[#F9FAFB] hover:border-dashboard-primary/30 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-2 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-[#E6F2FF] flex items-center justify-center">
                                    <Icon className="w-5 h-5 text-dashboard-primary" />
                                </div>
                                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded">
                                    {tag}
                                </span>
                            </div>
                            <h3 className="font-bold text-[#111827]">{title}</h3>
                            <p className="text-sm text-[#6B7280] mt-1">{desc}</p>
                            <span className="inline-block mt-2 px-2 py-1 rounded-lg text-xs font-medium bg-[#F3F4F6] text-[#374151]">
                                {highlight}
                            </span>
                            <button
                                onClick={() => openSalaryJourneyInNewTab()}
                                className="mt-4 flex items-center gap-1 text-dashboard-primary font-semibold text-sm hover:underline"
                            >
                                View Details <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
