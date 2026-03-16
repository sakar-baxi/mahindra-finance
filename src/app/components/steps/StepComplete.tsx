"use client";

import React, { useEffect, useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { useBranding } from "@/app/context/BrandingContext";
import {
  CheckCircle2,
  CreditCard,
  Gift,
  TrendingUp,
  ArrowRight,
  Home,
  Package,
  Zap,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";
import StepCard from "@/app/components/layout/StepCard";
import { PreApprovedOfferModal } from "@/app/components/shared/PreApprovedOfferModal";

export default function StepComplete() {
  const { formData, setBottomBarContent } = useJourney();
  const { config } = useBranding();
  const [isApiLoading, setIsApiLoading] = useState(true);
  const completeLoadingMs = 1500;

  useEffect(() => {
    trackEvent("journey_completed");
    trackEvent("step_completed", { step: "complete" });
    setBottomBarContent(null);
    const timer = setTimeout(() => setIsApiLoading(false), completeLoadingMs);
    return () => clearTimeout(timer);
  }, [setBottomBarContent]);

  // Lending only: no core banking (no credit card, insurance, demat)
  const offers = [
    { id: "personal-loan", icon: TrendingUp, title: "Personal Loan", desc: "Up to ₹15L instant disbursal", highlight: "From 10.5% p.a.", gradient: "from-violet-500 to-purple-600", applyLabel: "Apply for loan" },
    { id: "home-loan", icon: Home, title: "Home Loan", desc: "Refinancing from 8.45% p.a.", highlight: "Low EMI", gradient: "from-amber-500 to-orange-600", applyLabel: "Apply for home loan" },
    { id: "car-loan", icon: Package, title: "Car Loan", desc: "Vehicle financing at competitive rates", highlight: "Flexible tenure", gradient: "from-blue-500 to-indigo-600", applyLabel: "Apply for car loan" },
    { id: "business-loan", icon: Zap, title: "Business Loan", desc: "Business financing for eligible applicants", highlight: "Quick disbursal", gradient: "from-emerald-500 to-teal-600", applyLabel: "Apply for business loan" },
    { id: "lap", icon: Gift, title: "LAP (Loan Against Property)", desc: "Loan against property for your needs", highlight: "High value", gradient: "from-rose-500 to-pink-600", applyLabel: "Apply for LAP" },
  ];
  const [selectedOffer, setSelectedOffer] = useState<(typeof offers)[0] | null>(null);
  const [offerSearch, setOfferSearch] = useState("");

  const filteredOffers = offerSearch.trim()
    ? offers.filter((o) =>
        o.title.toLowerCase().includes(offerSearch.toLowerCase()) ||
        o.id.toLowerCase().includes(offerSearch.toLowerCase())
      )
    : offers;

  const userName = formData.name?.split?.(" ")[0] || formData.fatherName?.split?.()[0] || "there";

  if (isApiLoading) {
    return (
      <StepCard maxWidth="6xl">
        <div className="flex flex-col items-center justify-center py-24 animate-in fade-in duration-700">
          <div className="w-16 h-16 rounded-2xl border-2 border-slate-200 flex items-center justify-center animate-pulse">
            <CheckCircle2 className="w-8 h-8 text-slate-300" />
          </div>
          <h2 className="mt-6 text-lg font-semibold text-slate-700">Finalising your account</h2>
          <p className="mt-1 text-sm text-slate-500">Setting things up...</p>
        </div>
      </StepCard>
    );
  }

  return (
    <>
    <StepCard maxWidth="6xl" className="!p-0 overflow-hidden">
      <div className="overflow-hidden">
        {/* Hero - depth, warmth, visual interest */}
        <div className="relative px-6 pt-12 pb-10 md:pt-16 md:pb-14 overflow-hidden">
          {/* Layered background */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{ background: `radial-gradient(ellipse 80% 50% at 50% 0%, var(--primary-bank), transparent 70%)` }}
          />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full blur-3xl opacity-20" style={{ background: "var(--primary-bank)" }} />
          {/* Decorative arcs */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <svg className="absolute bottom-0 left-0 w-full h-16 opacity-[0.04]" style={{ color: "var(--primary-bank)" }} preserveAspectRatio="none" viewBox="0 0 100 10">
            <path d="M0 10 Q25 0 50 10 T100 10" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>

          <div className="relative flex flex-col items-center text-center">
            {/* Success icon - layered, with glow */}
            <div className="relative">
              <div className="absolute inset-0 scale-150 rounded-full opacity-20 blur-xl" style={{ background: "var(--primary-bank)" }} />
              <div
                className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-white/80"
                style={{ backgroundColor: "var(--primary-bank)", color: "white", boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)" }}
              >
                <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12" strokeWidth={2.5} />
              </div>
            </div>

            <span className="mt-8 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-100">
              Application complete
            </span>
            <h1 className="mt-4 text-2xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Account activated
            </h1>
            <p className="mt-3 text-slate-600 text-base md:text-lg max-w-md leading-relaxed">
              Welcome, {userName}. Your {config.name} savings account is ready to use.
            </p>
          </div>
        </div>

        {/* Account Details - card with subtle depth */}
        <div className="px-6 py-6 md:px-8 md:py-8 space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-7 shadow-sm shadow-slate-200/50">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100" style={{ color: "var(--primary-bank)" }}>
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account details</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">CIF</p>
                <p className="mt-1.5 text-base font-semibold text-slate-900 tabular-nums">{formData.cif ?? "192837465"}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Account</p>
                <p className="mt-1.5 text-base font-semibold text-slate-900 tabular-nums">{formData.accountNumber ?? "XXXX XXXX 1234"}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Branch</p>
                <p className="mt-1.5 text-base font-semibold text-slate-900">{formData.branchName ?? "Mumbai Main"}</p>
              </div>
            </div>
          </div>

          {/* Welcome Kit - minimal */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white border border-slate-200" style={{ color: "var(--primary-bank)" }}>
              <Package className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">Welcome kit</p>
              <p className="text-xs text-slate-500 mt-0.5">Track your applications via SMS or app.</p>
            </div>
          </div>

          {/* Pre-approved - exciting, visual, clickable */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-4 md:px-6 md:py-5 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-800">Exclusive for you</h3>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm">
                  Pre-approved
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2">Apply for other services—type to search offers, then tap to apply.</p>
              <input
                type="text"
                placeholder="Type: personal loan, home loan, car loan..."
                value={offerSearch}
                onChange={(e) => setOfferSearch(e.target.value)}
                className="mt-3 w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-500"
              />
            </div>

            <div className="p-4 md:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOffers.length === 0 ? (
                  <p className="col-span-full text-sm text-slate-500 py-4">No offers match &quot;{offerSearch}&quot;. Try &quot;personal loan&quot; or &quot;home loan&quot;.</p>
                ) : (
                filteredOffers.map((offer, i) => (
                  <div
                    key={offer.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      trackEvent("cross_sell_click", { offer: offer.id, title: offer.title });
                      setSelectedOffer(offer);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedOffer(offer)}
                    className={cn(
                      "group relative rounded-xl p-4 md:p-5 overflow-hidden cursor-pointer",
                      "border-2 border-slate-100 hover:border-slate-200 transition-all duration-300",
                      "hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
                      "bg-white hover:bg-slate-50/50"
                    )}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-bl-3xl bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity", offer.gradient)} />
                    <div className={cn("relative w-11 h-11 rounded-xl flex items-center justify-center text-white", `bg-gradient-to-br ${offer.gradient}`)}>
                      <offer.icon className="w-5 h-5" />
                    </div>
                    <h4 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-slate-800">{offer.title}</h4>
                    <p className="mt-0.5 text-xs text-slate-500">{offer.desc}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: "var(--primary-bank)" }}>
                      {offer.highlight}
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                ))
                )}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  className="flex-1 h-11 font-semibold rounded-xl"
                  style={{ backgroundColor: "var(--primary-bank)", color: "white" }}
                  onClick={() => trackEvent("cross_sell_click", { offer: "setup_mobile_banking" })}
                >
                  Setup Mobile Banking
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-11 font-semibold rounded-xl border-slate-200"
                  onClick={() => trackEvent("cross_sell_click", { offer: "view_passbook" })}
                >
                  View Passbook
                </Button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-400 text-[11px] font-medium py-6">
          © {config.name}
        </p>
      </div>
    </StepCard>
    {selectedOffer && (
      <PreApprovedOfferModal
        offer={selectedOffer}
        onClose={() => setSelectedOffer(null)}
      />
    )}
    </>
  );
}
