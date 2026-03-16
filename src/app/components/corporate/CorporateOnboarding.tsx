"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
    Building2,
    Check,
    Loader2,
    ChevronRight,
    ChevronLeft,
    Send,
    Database,
    Key,
    Map,
    CheckCircle2,
} from "lucide-react";

const ONBOARDING_STEPS = [
    { id: "corporate-details", label: "Corporate Details" },
    { id: "kyb-verification", label: "KYB Verification" },
    { id: "verified-profile", label: "Verified Profile" },
    { id: "connection-setup", label: "Connection Setup" },
    { id: "data-source", label: "Data Source" },
    { id: "hrms-selection", label: "HRMS Selection" },
    { id: "hrms-credentials", label: "HRMS Credentials" },
    { id: "data-mapping", label: "Data Mapping" },
    { id: "connection-active", label: "Connection Active" },
] as const;

export interface OnboardedCorporate {
    corporateName: string;
    categories: string;
    connections: string;
    status: "Active" | "Pending";
    contactName: string;
    dateAdded: string;
    corpCategory?: "CAT A" | "CAT B" | "CAT C";
    kybStatus?: "Verified" | "Pending" | "In Review";
}

export interface CorporateOnboardingForm {
    companyName: string;
    pocName: string;
    pocEmail: string;
    gstNumber: string;
    cinNumber: string;
    connectionMode: "setup-behalf" | "invite-hr";
    dataSource: "hrms" | "sftp" | "push" | "csv";
    hrmsProvider: string;
    hostUrl: string;
    hrmsUsername: string;
    hrmsPassword: string;
    mappedFields: Record<string, boolean>;
}

const MANDATORY_FIELDS = ["Name", "Mobile Number"];
const COMPANY_FIELDS = ["Registered Name", "PAN", "Registered Address", "GST"];

const HRMS_PROVIDERS = ["Keka", "DarwinBox", "BambooHR", "ZingHR", "Greythr"];

interface CorporateOnboardingProps {
    onComplete: (corporate: OnboardedCorporate) => void;
    onCancel: () => void;
}

export default function CorporateOnboarding({ onComplete, onCancel }: CorporateOnboardingProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [form, setForm] = useState<CorporateOnboardingForm>({
        companyName: "Acme Technologies Pvt Ltd",
        pocName: "Ananya Sharma",
        pocEmail: "ananya.sharma@acmetech.com",
        gstNumber: "29ABCDE1234F1Z5",
        cinNumber: "U12345KA2019PTC123456",
        connectionMode: "setup-behalf",
        dataSource: "hrms",
        hrmsProvider: "Keka",
        hostUrl: "https://data.keka.com",
        hrmsUsername: "acme_hrms_user",
        hrmsPassword: "••••••••",
        mappedFields: Object.fromEntries([...MANDATORY_FIELDS, ...COMPANY_FIELDS].map((f) => [f, MANDATORY_FIELDS.includes(f)])),
    });
    const [notes, setNotes] = useState("");
    const [showDataMappingModal, setShowDataMappingModal] = useState(false);

    // Corporate category from MFSL rule engine (derived from KYB inputs); shown once KYB verification is complete
    const kybCorpCategory = useMemo((): "CAT A" | "CAT B" | "CAT C" => {
        const name = (form.companyName || "").trim().toUpperCase();
        if (!name) return "CAT A";
        const code = name.charCodeAt(0);
        if (code >= 65 && code <= 77) return "CAT A";
        if (code >= 78 && code <= 82) return "CAT B";
        return "CAT C";
    }, [form.companyName]);

    const currentStepId = ONBOARDING_STEPS[currentStepIndex].id;
    const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1;

    const handleComplete = () => {
        const corp: OnboardedCorporate = {
            corporateName: form.companyName || "New Corporate",
            categories: "HRIS",
            connections: form.hrmsProvider || "HRMS",
            status: "Active",
            contactName: form.pocName,
            dateAdded: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            corpCategory: kybCorpCategory,
            kybStatus: "Verified",
        };
        onComplete(corp);
    };

    const goNext = () => {
        if (isLastStep) {
            handleComplete();
        } else if (currentStepId === "data-mapping" && !showDataMappingModal) {
            setShowDataMappingModal(true);
        } else {
            setShowDataMappingModal(false);
            setCurrentStepIndex((i) => Math.min(i + 1, ONBOARDING_STEPS.length - 1));
        }
    };

    const goBack = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex((i) => Math.max(0, i - 1));
        }
    };

    const updateForm = (updates: Partial<CorporateOnboardingForm>) => setForm((f) => ({ ...f, ...updates }));

    return (
        <div className="flex h-full min-h-0">
            {/* Main content */}
            <div className="flex-1 min-w-0 overflow-y-auto">
                <div className="p-6 max-w-2xl">
                    {/* Banner */}
                    <div className="mb-6 p-4 rounded-xl bg-dashboard-primary-light border border-dashboard-primary/20">
                        <p className="text-sm text-[#374151]">
                            Let&apos;s onboard a new corporate. We&apos;ll capture basic details, run KYB checks, and connect their HRMS for data sync.
                        </p>
                    </div>

                    {/* Step 1: Corporate Details */}
                    {currentStepId === "corporate-details" && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-[#111827]">STEP: Corporate details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#374151] mb-2">Company Name</label>
                                    <input type="text" value={form.companyName} onChange={(e) => updateForm({ companyName: e.target.value })} placeholder="Acme Technologies Pvt Ltd" className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#374151] mb-2">Point of Contact Name</label>
                                    <input type="text" value={form.pocName} onChange={(e) => updateForm({ pocName: e.target.value })} placeholder="Ananya Sharma" className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#374151] mb-2">Point of Contact Email</label>
                                    <input type="email" value={form.pocEmail} onChange={(e) => updateForm({ pocEmail: e.target.value })} placeholder="name@company.com" className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#374151] mb-2">GST Number</label>
                                    <input type="text" value={form.gstNumber} onChange={(e) => updateForm({ gstNumber: e.target.value })} placeholder="29ABCDE1234F1Z5" className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-[#374151] mb-2">CIN Number</label>
                                    <input type="text" value={form.cinNumber} onChange={(e) => updateForm({ cinNumber: e.target.value })} placeholder="U12345KA2019PTC123456" className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm" />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                {currentStepIndex > 0 && (
                                    <button onClick={goBack} className="h-10 px-5 border border-[#E5E7EB] text-[#374151] font-medium text-sm rounded-lg hover:bg-[#F9FAFB] flex items-center gap-2">
                                        <ChevronLeft className="w-4 h-4" /> Back
                                    </button>
                                )}
                                <button onClick={goNext} className="h-10 px-5 bg-dashboard-primary text-white font-medium text-sm rounded-lg hover:bg-dashboard-primary-dark transition-colors">
                                    Save & continue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: KYB Verification */}
                    {currentStepId === "kyb-verification" && (
                        <div className="space-y-6">
                            <div className="p-2 px-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium w-fit">Corporate details confirmed ✓</div>
                            <h2 className="text-lg font-bold text-[#111827]">KYB verification complete</h2>
                            <p className="text-sm text-[#6B7280]">We&apos;ve verified the business and compliance status. Corporate categorisation for prospecting is based on the Mahindra MFSL rule engine using KYB inputs.</p>
                            <div className="rounded-xl border border-[#E5E7EB] p-6 space-y-4">
                                <div className="flex justify-between"><span className="text-sm text-[#6B7280]">Status</span><span className="font-medium text-emerald-600">Verified</span></div>
                                <div className="flex justify-between"><span className="text-sm text-[#6B7280]">Business registration</span><span className="font-medium">Matches GST/CIN</span></div>
                                <div className="flex justify-between"><span className="text-sm text-[#6B7280]">Corporate structure</span><span className="font-medium">Validated</span></div>
                                <div className="flex justify-between"><span className="text-sm text-[#6B7280]">Tax checks</span><span className="font-medium">No issues detected</span></div>
                                <div className="flex justify-between items-center pt-2 border-t border-[#E5E7EB]">
                                    <span className="text-sm text-[#6B7280]">Corporate category (MFSL)</span>
                                    <span className={cn("px-2 py-1 rounded-full text-xs font-semibold", kybCorpCategory === "CAT A" ? "bg-dashboard-primary-light text-dashboard-primary" : kybCorpCategory === "CAT B" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600")}>
                                        {kybCorpCategory}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={goBack} className="h-10 px-5 border border-[#E5E7EB] text-[#374151] font-medium text-sm rounded-lg hover:bg-[#F9FAFB] flex items-center gap-2">
                                    <ChevronLeft className="w-4 h-4" /> Back
                                </button>
                                <button onClick={goNext} className="h-10 px-5 bg-dashboard-primary text-white font-medium text-sm rounded-lg hover:bg-dashboard-primary-dark">
                                    Review verified details
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Verified Corporate Profile */}
                    {currentStepId === "verified-profile" && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-[#111827]">STEP: Verified corporate profile</h2>
                            <div className="rounded-xl border border-[#E5E7EB] p-6 space-y-3">
                                <div><span className="text-sm text-[#6B7280]">Company Name:</span> <span className="font-medium">{form.companyName || "Acme Global"}</span></div>
                                <div><span className="text-sm text-[#6B7280]">GST Number:</span> <span className="font-medium">{form.gstNumber || "29ABCDE1234F1Z5"}</span></div>
                                <div><span className="text-sm text-[#6B7280]">CIN Number:</span> <span className="font-medium">{form.cinNumber || "U12345KA2019PTC123456"}</span></div>
                                <div><span className="text-sm text-[#6B7280]">Point of Contact:</span> <span className="font-medium">{form.pocName || "Dummy"} • {form.pocEmail || "a@a.com"}</span></div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={goBack} className="h-10 px-5 border border-[#E5E7EB] text-[#374151] font-medium text-sm rounded-lg hover:bg-[#F9FAFB] flex items-center gap-2">
                                    <ChevronLeft className="w-4 h-4" /> Back
                                </button>
                                <button onClick={goNext} className="h-10 px-5 border border-dashboard-primary text-dashboard-primary font-medium text-sm rounded-lg hover:bg-dashboard-primary-light">
                                    Continue to connection setup
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Connection Setup */}
                    {currentStepId === "connection-setup" && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-[#111827]">STEP: Connection setup</h2>
                            <div className="space-y-3">
                                <label className={cn("flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors", form.connectionMode === "setup-behalf" ? "border-dashboard-primary bg-dashboard-primary-light" : "border-[#E5E7EB] hover:bg-[#F9FAFB]")}>
                                    <input type="radio" name="connectionMode" checked={form.connectionMode === "setup-behalf"} onChange={() => updateForm({ connectionMode: "setup-behalf" })} className="mt-1" />
                                    <div>
                                        <span className="font-medium">Set up on behalf of HR</span>
                                        <p className="text-sm text-[#6B7280] mt-0.5">Use HR credentials now and configure data sync for the corporate.</p>
                                    </div>
                                </label>
                                <label className={cn("flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer opacity-75", form.connectionMode === "invite-hr" ? "border-dashboard-primary" : "border-[#E5E7EB]")}>
                                    <input type="radio" name="connectionMode" checked={form.connectionMode === "invite-hr"} onChange={() => updateForm({ connectionMode: "invite-hr" })} className="mt-1" />
                                    <div>
                                        <span className="font-medium">Invite HR (coming soon)</span>
                                        <p className="text-sm text-[#6B7280] mt-0.5">Send an invite so HR can complete setup later. Available in production.</p>
                                    </div>
                                </label>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={goBack} className="h-10 px-5 border border-[#E5E7EB] text-[#374151] font-medium text-sm rounded-lg hover:bg-[#F9FAFB] flex items-center gap-2">
                                    <ChevronLeft className="w-4 h-4" /> Back
                                </button>
                                <button onClick={goNext} className="h-10 px-5 bg-dashboard-primary text-white font-medium text-sm rounded-lg">
                                    Set up HRMS connection
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Data Source */}
                    {currentStepId === "data-source" && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-[#111827]">STEP: Data source</h2>
                            <div className="space-y-3">
                                <label className={cn("flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors", form.dataSource === "hrms" ? "border-dashboard-primary bg-dashboard-primary-light" : "border-[#E5E7EB]")}>
                                    <input type="radio" name="dataSource" checked={form.dataSource === "hrms"} onChange={() => updateForm({ dataSource: "hrms" })} className="mt-1" />
                                    <div>
                                        <span className="font-medium">HRMS integration - Recommended</span>
                                        <p className="text-sm text-[#6B7280] mt-0.5">Direct, automated sync from the HR system.</p>
                                    </div>
                                </label>
                                <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]">
                                    <p className="text-sm text-[#6B7280]">Other methods (SFTP, Push API, CSV upload) will be enabled for bulk and event-based integrations in production.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={goBack} className="h-10 px-5 border border-[#E5E7EB] text-[#374151] font-medium text-sm rounded-lg hover:bg-[#F9FAFB] flex items-center gap-2">
                                    <ChevronLeft className="w-4 h-4" /> Back
                                </button>
                                <button onClick={goNext} className="h-10 px-5 border border-dashboard-primary text-dashboard-primary font-medium text-sm rounded-lg hover:bg-dashboard-primary-light">
                                    Continue with HRMS
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 6: HRMS Selection */}
                    {currentStepId === "hrms-selection" && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-[#111827]">STEP: HRMS provider</h2>
                            <select value={form.hrmsProvider} onChange={(e) => updateForm({ hrmsProvider: e.target.value })} className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm">
                                {HRMS_PROVIDERS.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                            <div className="flex gap-3">
                                <button onClick={goBack} className="h-10 px-5 border border-[#E5E7EB] text-[#374151] font-medium text-sm rounded-lg hover:bg-[#F9FAFB] flex items-center gap-2">
                                    <ChevronLeft className="w-4 h-4" /> Back
                                </button>
                                <button onClick={goNext} className="h-10 px-5 bg-dashboard-primary text-white font-medium text-sm rounded-lg">
                                    Confirm provider
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 7: HRMS Credentials */}
                    {currentStepId === "hrms-credentials" && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-[#111827]">STEP: {form.hrmsProvider} connection</h2>
                            <p className="text-sm text-[#6B7280]">Enter your {form.hrmsProvider} credentials (encrypted, used only for sync).</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#374151] mb-2">Host URL</label>
                                    <input type="text" value={form.hostUrl} onChange={(e) => updateForm({ hostUrl: e.target.value })} placeholder="https://yourcompany.hrms.com" className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#374151] mb-2">Username</label>
                                    <input type="text" value={form.hrmsUsername} onChange={(e) => updateForm({ hrmsUsername: e.target.value })} placeholder="integration@company.com" className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#374151] mb-2">Password</label>
                                    <input type="password" value={form.hrmsPassword} onChange={(e) => updateForm({ hrmsPassword: e.target.value })} placeholder="••••••••" className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm" />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={goBack} className="h-10 px-5 border border-[#E5E7EB] text-[#374151] font-medium text-sm rounded-lg hover:bg-[#F9FAFB] flex items-center gap-2">
                                    <ChevronLeft className="w-4 h-4" /> Back
                                </button>
                                <button onClick={goNext} className="h-10 px-5 bg-dashboard-primary text-white font-medium text-sm rounded-lg flex items-center gap-2">
                                    Connect HRMS
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 8: Data Mapping */}
                    {currentStepId === "data-mapping" && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-[#111827]">STEP: Data mapping</h2>
                            <div className="rounded-xl border border-[#E5E7EB] p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-[#111827]">Current mapping summary</p>
                                    <p className="text-xs text-[#6B7280] mt-1">Mandatory: {MANDATORY_FIELDS.length} (Name, Mobile Number) • Company: {COMPANY_FIELDS.length}</p>
                                </div>
                                <button onClick={() => setShowDataMappingModal(true)} className="h-10 px-4 border border-dashboard-primary text-dashboard-primary font-medium text-sm rounded-lg">
                                    Configure fields
                                </button>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={goBack} className="h-10 px-5 border border-[#E5E7EB] text-[#374151] font-medium text-sm rounded-lg hover:bg-[#F9FAFB] flex items-center gap-2">
                                    <ChevronLeft className="w-4 h-4" /> Back
                                </button>
                                <button onClick={goNext} className="h-10 px-5 bg-dashboard-primary text-white font-medium text-sm rounded-lg">
                                    Configure & continue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 9: Connection Active */}
                    {currentStepId === "connection-active" && (
                        <div className="space-y-6">
                            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-emerald-800">Connection Successful</h2>
                                        <p className="text-sm text-emerald-700">HRMS connection established with {form.hrmsProvider}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-[#374151]">Data sync is now active for {form.companyName || "this corporate"}. Mandatory employee and company fields are mapped.</p>
                            </div>
                            <div className="rounded-xl border border-dashboard-primary/30 bg-dashboard-primary-light p-5">
                                <h3 className="font-semibold text-[#111827] mb-3">Next actions</h3>
                                <ul className="space-y-2 text-sm text-[#6B7280] list-disc list-inside">
                                    <li>Monitor first sync in analytics.</li>
                                    <li>Configure product eligibility for this corporate.</li>
                                    <li>Invite employees to activate their accounts.</li>
                                </ul>
                            </div>
                            <button onClick={handleComplete} className="h-10 px-5 bg-dashboard-primary text-white font-medium text-sm rounded-lg">
                                Done
                            </button>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="mt-10 pt-6 border-t border-[#E5E7EB]">
                        <div className="flex gap-2">
                            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ask or type notes while onboarding..." className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm" />
                            <button type="button" className="p-2.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#6B7280]">
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right sidebar - Onboarding Progress */}
            <aside className="w-64 flex-shrink-0 border-l border-[#E5E7EB] bg-[#F9FAFB] p-5 flex flex-col">
                <h3 className="text-sm font-semibold text-[#111827] flex items-center gap-2 mb-4">
                    <Check className="w-4 h-4 text-dashboard-primary" />
                    Onboarding Progress
                </h3>
                <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Loader2 className="w-4 h-4 animate-spin text-dashboard-primary" />
                        <span className="text-sm font-medium">In Progress</span>
                    </div>
                    <p className="text-xs text-[#6B7280]">Corporate onboarding & HRMS connection</p>
                </div>
                <div className="space-y-2">
                    {ONBOARDING_STEPS.map((step, i) => {
                        const done = i < currentStepIndex || (i === currentStepIndex && currentStepId === "connection-active");
                        const inProgress = i === currentStepIndex && currentStepId !== "connection-active";
                        return (
                            <div key={step.id} className={cn("flex items-center gap-2 text-sm", done ? "text-emerald-600" : inProgress ? "text-dashboard-primary font-medium" : "text-[#9CA3AF]")}>
                                {done ? <Check className="w-4 h-4 shrink-0" /> : <div className={cn("w-4 h-4 rounded-full shrink-0", inProgress ? "bg-dashboard-primary" : "bg-[#E5E7EB]")} />}
                                <span>{step.label}</span>
                                {inProgress && <span className="text-xs">(In progress...)</span>}
                            </div>
                        );
                    })}
                </div>
            </aside>

            {/* Data Mapping Modal */}
            {showDataMappingModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDataMappingModal(false)}>
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-[#E5E7EB]">
                            <h3 className="text-lg font-bold text-[#111827]">Configure data mapping</h3>
                            <p className="text-sm text-[#6B7280] mt-1">Core fields required for product journeys.</p>
                        </div>
                        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
                            <div>
                                <p className="text-xs font-semibold text-[#6B7280] uppercase mb-2">Mandatory Data Points</p>
                                <div className="space-y-2">
                                    {MANDATORY_FIELDS.map((f) => (
                                        <label key={f} className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={form.mappedFields[f] ?? true} onChange={(e) => updateForm({ mappedFields: { ...form.mappedFields, [f]: e.target.checked } })} className="rounded" />
                                            <span className="text-sm">{f}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-[#6B7280] uppercase mb-2">Company Details (Additional KYC and Contact Information)</p>
                                <div className="space-y-2">
                                    {COMPANY_FIELDS.map((f) => (
                                        <label key={f} className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={form.mappedFields[f] ?? false} onChange={(e) => updateForm({ mappedFields: { ...form.mappedFields, [f]: e.target.checked } })} className="rounded" />
                                            <span className="text-sm">{f}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-5 border-t border-[#E5E7EB] flex gap-3 justify-end">
                            <button onClick={() => setShowDataMappingModal(false)} className="h-10 px-4 border border-[#E5E7EB] rounded-lg font-medium text-sm hover:bg-[#F9FAFB]">Cancel</button>
                            <button onClick={() => { setShowDataMappingModal(false); goNext(); }} className="h-10 px-4 bg-dashboard-primary text-white font-medium text-sm rounded-lg">Save & continue</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
