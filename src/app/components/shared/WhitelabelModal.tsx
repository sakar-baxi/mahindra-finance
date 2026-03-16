"use client";

import React, { useState, useRef } from "react";
import { useBranding } from "@/app/context/BrandingContext";
import { useJourneyConfig } from "@/app/context/JourneyConfigContext";
import type {
  StepConfig,
  FieldConfig,
  ModuleConfig,
  DataSource,
  ModuleProvider,
  StepKind,
  FieldKind,
  ModuleKind,
  ThirdPartyVendor,
  ApiConfig,
  FieldComponentType,
  InputFieldType,
  PrefillMode,
  ValidationRule,
} from "@/app/context/JourneyConfigContext";
import {
  STEP_KINDS,
  FIELD_KINDS,
  MODULE_KINDS,
  THIRD_PARTY_VENDORS_BY_MODULE,
  VENDOR_LABELS,
} from "@/app/context/JourneyConfigContext";
import {
    X,
    Palette,
    Square,
  Upload,
    Layers,
    Settings2,
    RotateCcw,
  Globe,
  GripVertical,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Image,
  Sparkles,
  MessageCircle,
  Zap,
  Save,
  Download,
  FileUp,
  Type,
  FileText,
  HelpCircle,
  Plug,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";

interface WhitelabelModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type WizardStep = 1 | 2 | 3 | 4;

const WIZARD_STEPS: { step: WizardStep; label: string; icon: React.ElementType }[] = [
  { step: 1, label: "Journey & Bank", icon: Layers },
  { step: 2, label: "Branding", icon: Palette },
  { step: 3, label: "Structure", icon: Square },
  { step: 4, label: "Fine-tune", icon: Settings2 },
];

const COMPONENT_TYPES: { id: FieldComponentType; label: string; icon: React.ElementType }[] = [
  { id: "input", label: "Input Field", icon: Type },
  { id: "documentUpload", label: "Document Upload", icon: FileUp },
  { id: "api", label: "API", icon: Plug },
];

const INPUT_TYPES: { id: InputFieldType; label: string }[] = [
  { id: "string", label: "String" },
  { id: "number", label: "Number" },
  { id: "date", label: "Date" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "pan", label: "PAN" },
  { id: "aadhaar", label: "Aadhaar" },
  { id: "dropdown", label: "Dropdown" },
];

const PREFILL_MODES: { id: PrefillMode; label: string }[] = [
  { id: "manual", label: "Manual entry only" },
  { id: "prefill", label: "Prefill from API" },
  { id: "prefillEditable", label: "Prefill + Editable" },
  { id: "prefillReadOnly", label: "Prefill + Read-only" },
];

function FieldConfigCard({ field, onUpdate }: { field: FieldConfig; onUpdate: (u: Partial<FieldConfig>) => void }) {
  const [expanded, setExpanded] = useState(false);
  const componentType = field.componentType ?? "input";
  const apiConfig = field.apiConfig ?? {};

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden">
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50"
        onClick={() => setExpanded((e) => !e)}
      >
        <ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform", expanded && "rotate-90")} />
        <input
          type="text"
          value={field.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-sm font-medium bg-white"
          placeholder="Field label"
        />
        <select
          value={field.source}
          onChange={(e) => onUpdate({ source: e.target.value as DataSource })}
          onClick={(e) => e.stopPropagation()}
          className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium bg-white"
        >
          <option value="bank-api">Bank API</option>
          <option value="tartan-api">Tartan API</option>
          <option value="manual">Manual</option>
        </select>
        <span className="text-[10px] font-semibold text-slate-500 uppercase px-2 py-1 rounded bg-slate-200/80">
          {componentType}
        </span>
      </div>
      {expanded && (
        <div className="flex flex-col gap-4 p-4 pt-0 border-t border-slate-200">
          {/* Component Type */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-2">Component Type</label>
            <div className="flex gap-2">
              {COMPONENT_TYPES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onUpdate({ componentType: id })}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border-2 transition-all",
                    componentType === id ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>
          </div>
          {/* Input Field: type, placeholder, prefill */}
          {(componentType === "input" || !componentType) && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">Field Type</label>
                <select
                  value={field.inputType ?? "string"}
                  onChange={(e) => onUpdate({ inputType: e.target.value as InputFieldType })}
                  className="h-9 px-3 rounded-lg border border-slate-200 text-sm font-medium w-full"
                >
                  {INPUT_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">Placeholder</label>
                <input
                  type="text"
                  value={field.placeholder ?? ""}
                  onChange={(e) => onUpdate({ placeholder: e.target.value })}
                  placeholder="Enter placeholder text"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">Data Entry</label>
                <select
                  value={field.prefillMode ?? "manual"}
                  onChange={(e) => onUpdate({ prefillMode: e.target.value as PrefillMode })}
                  className="h-9 px-3 rounded-lg border border-slate-200 text-sm font-medium w-full"
                >
                  {PREFILL_MODES.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          {/* Document Upload */}
          {componentType === "documentUpload" && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">Allowed File Types</label>
                <div className="flex flex-wrap gap-2">
                  {["PDF", "JPG", "JPEG", "PNG", "DOC", "DOCX"].map((t) => {
                    const current = field.allowedFileTypes ?? ["PDF", "JPG", "PNG"];
                    const checked = current.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => onUpdate({
                          allowedFileTypes: checked
                            ? current.filter((x) => x !== t)
                            : [...current, t],
                        })}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                          checked ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">Max File Size (MB)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={field.maxFileSizeMb ?? 5}
                  onChange={(e) => onUpdate({ maxFileSizeMb: parseInt(e.target.value, 10) || 5 })}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">Instructions (optional)</label>
                <input
                  type="text"
                  value={field.uploadInstructions ?? ""}
                  onChange={(e) => onUpdate({ uploadInstructions: e.target.value })}
                  placeholder="e.g., Please upload a clear copy of your ID"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm"
                />
              </div>
            </>
          )}
          {/* API: Priority-based selection */}
          {componentType === "api" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">Main API (primary)</label>
                <input
                  type="text"
                  value={apiConfig.main?.apiName ?? ""}
                  onChange={(e) => onUpdate({
                    apiConfig: { ...apiConfig, main: { ...apiConfig.main, apiName: e.target.value } },
                  })}
                  placeholder="e.g., KYC Verification API"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">Fallback API (backup)</label>
                <input
                  type="text"
                  value={apiConfig.fallback?.apiName ?? ""}
                  onChange={(e) => onUpdate({
                    apiConfig: { ...apiConfig, fallback: { ...apiConfig.fallback, apiName: e.target.value } },
                  })}
                  placeholder="Optional - used if main fails"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">Additional APIs</label>
                <input
                  type="text"
                  value={apiConfig.additional?.map((a) => a.apiName).filter(Boolean).join(", ") ?? ""}
                  onChange={(e) => onUpdate({
                    apiConfig: {
                      ...apiConfig,
                      additional: e.target.value.split(",").map((n) => ({ apiName: n.trim() })).filter((a) => a.apiName),
                    },
                  })}
                  placeholder="e.g., API 1, API 2 (comma-separated)"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">Data Entry</label>
                <select
                  value={field.prefillMode ?? "prefillEditable"}
                  onChange={(e) => onUpdate({ prefillMode: e.target.value as PrefillMode })}
                  className="h-9 px-3 rounded-lg border border-slate-200 text-sm font-medium w-full"
                >
                  {PREFILL_MODES.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {/* Validations */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-2">Validations</label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`req-${field.id}`}
                checked={field.required ?? false}
                onChange={(e) => onUpdate({ required: e.target.checked })}
                className="rounded"
              />
              <label htmlFor={`req-${field.id}`} className="text-sm font-medium text-slate-700">Required</label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WhitelabelModal({ isOpen, onClose }: WhitelabelModalProps) {
  const { config: brandingConfig, updateConfig, setTheme } = useBranding();
  const {
    config: journeyConfig,
    updateConfig: updateJourneyConfig,
    updateSteps,
    addStep,
    removeStep,
    reorderSteps,
    updateStepFields,
    updateStepFieldLayouts,
    updateStep,
    updateModule,
    updateUx,
    setLogoAndExtractTheme,
    resetToDefaults,
    persist,
    importConfig,
    applyIdfcPreset,
    updateCtaLabels,
    updateStepTitles,
    updateLegalTexts,
    updateFieldOptions,
    updateErrorMessages,
    updateSupport,
  } = useJourneyConfig();
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(null);
  const [draggedStepIndex, setDraggedStepIndex] = useState<number | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    if (hasUnsavedChanges && !window.confirm("You have unsaved changes. Close anyway?")) return;
    setHasUnsavedChanges(false);
    onClose();
  };

  const markUnsaved = () => setHasUnsavedChanges(true);

  React.useEffect(() => {
    if (isOpen) setHasUnsavedChanges(false);
  }, [isOpen]);

    if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const extracted = await setLogoAndExtractTheme(dataUrl);
      updateConfig({
        logo: "custom",
        logoUrl: dataUrl,
        primary: extracted.primary,
        secondary: extracted.secondary,
        accent: extracted.accent,
      });
      markUnsaved();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const applyExtractedTheme = () => {
    const theme = journeyConfig.extractedTheme;
    if (theme) {
      updateConfig({
        primary: theme.primary,
        secondary: theme.secondary,
        accent: theme.accent,
      });
      markUnsaved();
    }
  };

  const getFieldsForStepKind = (stepKind: StepKind): FieldConfig[] => {
    const layout = journeyConfig.stepFieldLayouts?.[stepKind];
    if (layout && layout.length > 0) {
      return layout;
    }
    const mappings: Record<StepKind, FieldKind[]> = {
      welcome: ["name", "mobileNumber"],
      ekycHandler: ["aadhaarNumber", "otp", "consents"],
      profileDetails: [
        "occupation",
        "sourceOfIncome",
        "grossAnnualIncome",
        "motherName",
        "fatherName",
        "email",
        "maritalStatus",
        "incomeRange",
        "permanentAddress",
        "communicationAddress",
        "nomineeInfo",
        "declarations",
        "consents",
      ],
      kycChoice: [],
      physicalKyc: ["documentUpload"],
      reviewApplication: ["consents"],
      videoKyc: [],
      autoConversion: ["accountSelection"],
      etbIncomeDeclarations: ["incomeRange", "occupation", "sourceOfIncome", "declarations", "consents"],
      conversionVerification: ["otp"],
      complete: [],
      preApprovedOffers: [],
      nomineeDetails: ["nomineeInfo"],
      incomeDetails: ["incomeRange", "employmentDetails"],
      etbKycProfile: ["profileDetails"],
      custom: [],
    };
    const ids = mappings[stepKind] || [];
    return ids.map((id) => ({
      id,
      label: FIELD_KINDS.find((k) => k.id === id)?.label || id,
      source: "bank-api" as DataSource,
    }));
  };

  const loadDefaultNtbJourney = () => {
    const steps: StepConfig[] = [
      { id: "ntb-welcome", stepKind: "welcome", title: journeyConfig.stepTitles.welcome, fields: getFieldsForStepKind("welcome"), order: 0 },
      { id: "ntb-kycChoice", stepKind: "kycChoice", title: "Select KYC", fields: [], order: 1 },
      { id: "ntb-ekyc", stepKind: "ekycHandler", title: "Aadhaar e-KYC", fields: getFieldsForStepKind("ekycHandler"), order: 2 },
      { id: "ntb-profile", stepKind: "profileDetails", title: journeyConfig.stepTitles.profileDetails, fields: getFieldsForStepKind("profileDetails"), order: 3 },
      { id: "ntb-review", stepKind: "reviewApplication", title: journeyConfig.stepTitles.reviewApplication, fields: getFieldsForStepKind("reviewApplication"), order: 4 },
      { id: "ntb-preApprovedOffers", stepKind: "preApprovedOffers", title: "Pre-approved Offers", fields: [], order: 5 },
      { id: "ntb-video", stepKind: "videoKyc", title: journeyConfig.stepTitles.videoKyc, fields: [], order: 6 },
      { id: "ntb-complete", stepKind: "complete", title: journeyConfig.stepTitles.complete, fields: [], order: 7 },
    ];
    updateSteps(steps);
    setExpandedStepIndex(null);
  };

  const loadDefaultEtbJourney = () => {
    const steps: StepConfig[] = [
      { id: "etb-welcome", stepKind: "welcome", title: journeyConfig.stepTitles.welcome, fields: getFieldsForStepKind("welcome"), order: 0 },
      { id: "etb-autoConversion", stepKind: "autoConversion", title: journeyConfig.stepTitles.autoConversion, fields: getFieldsForStepKind("autoConversion"), order: 1 },
      { id: "etb-profile", stepKind: "profileDetails", title: journeyConfig.stepTitles.profileDetails, fields: getFieldsForStepKind("profileDetails"), order: 2 },
      { id: "etb-review", stepKind: "reviewApplication", title: journeyConfig.stepTitles.reviewApplication, fields: getFieldsForStepKind("reviewApplication"), order: 3 },
      { id: "etb-complete", stepKind: "complete", title: journeyConfig.stepTitles.complete, fields: [], order: 4 },
    ];
    updateSteps(steps);
    setExpandedStepIndex(null);
  };

  const loadDefaultEtbNkJourney = () => {
    const steps: StepConfig[] = [
      { id: "etb-nk-welcome", stepKind: "welcome", title: journeyConfig.stepTitles.welcome, fields: getFieldsForStepKind("welcome"), order: 0 },
      { id: "etb-nk-autoConversion", stepKind: "autoConversion", title: journeyConfig.stepTitles.autoConversion, fields: getFieldsForStepKind("autoConversion"), order: 1 },
      { id: "etb-nk-profile", stepKind: "profileDetails", title: journeyConfig.stepTitles.profileDetails, fields: getFieldsForStepKind("profileDetails"), order: 2 },
      { id: "etb-nk-complete", stepKind: "complete", title: journeyConfig.stepTitles.complete, fields: [], order: 3 },
    ];
    updateSteps(steps);
    setExpandedStepIndex(null);
  };

  const handleAddStep = () => {
    const newStep: StepConfig = {
      id: `step-${Date.now()}`,
      stepKind: "welcome",
      title: "New Step",
      fields: getFieldsForStepKind("welcome"),
      order: journeyConfig.steps.length,
    };
    addStep(newStep);
    setExpandedStepIndex(journeyConfig.steps.length);
  };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
            <div
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
            />

      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden relative flex flex-col animate-in fade-in zoom-in-95 duration-300">
                {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                            <Settings2 className="w-5 h-5" />
                        </div>
                        <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">
                Journey Builder Studio
              </h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                Modular Configuration • Customize Every Aspect
              </p>
                        </div>
                    </div>
                    <button
            onClick={handleClose}
                        className="w-10 h-10 rounded-xl hover:bg-slate-200/50 flex items-center justify-center transition-colors"
            aria-label="Close"
                    >
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

        {/* Wizard Progress */}
        <div className="flex border-b border-slate-100 bg-slate-50/30 px-6 shrink-0">
          {WIZARD_STEPS.map(({ step, label, icon: Icon }, i) => (
            <button
              key={step}
              onClick={() => setWizardStep(step)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px",
                wizardStep === step
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              <span className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                wizardStep >= step ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"
              )}>
                {step}
              </span>
              {label}
            </button>
          ))}
        </div>

                {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 min-h-0">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* STEP 1: Journey Type & Bank Name */}
            {wizardStep === 1 && (
              <>
                <section>
                  <header className="flex items-center gap-2 text-[#0047CC] mb-4">
                    <Layers className="w-4 h-4" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Journey Type
                    </h3>
                  </header>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={() => updateJourneyConfig({ journeyMode: "form" })}
                      className={cn(
                        "p-6 rounded-2xl border-2 text-left transition-all",
                        journeyConfig.journeyMode === "form"
                          ? "border-[var(--primary-bank)] bg-blue-50/50"
                          : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <Square className="w-8 h-8 mb-2 text-slate-600" />
                      <h4 className="font-bold text-slate-800">Form-based</h4>
                      <p className="text-xs text-slate-500 mt-1">Traditional step-by-step flow</p>
                    </button>
                    <button
                      onClick={() => updateJourneyConfig({ journeyMode: "conversational" })}
                      className={cn(
                        "p-6 rounded-2xl border-2 text-left transition-all",
                        journeyConfig.journeyMode === "conversational"
                          ? "border-[var(--primary-bank)] bg-blue-50/50"
                          : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <MessageCircle className="w-8 h-8 mb-2 text-slate-600" />
                      <h4 className="font-bold text-slate-800">Conversational</h4>
                      <p className="text-xs text-slate-500 mt-1">AI-powered, quick, HRMS backfill</p>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Employees will see this journey type when they open their invite link.
                  </p>
                </section>
                <section>
                  <header className="flex items-center gap-2 text-[#0047CC] mb-4">
                    <Layers className="w-4 h-4" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Bank Name
                    </h3>
                  </header>
                  <input
                    type="text"
                    value={journeyConfig.bankName || ""}
                    onChange={(e) => updateJourneyConfig({ bankName: e.target.value })}
                    placeholder="e.g. Mahindra Finance"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-medium"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    This name appears throughout the journey (headings, messages, consent text).
                  </p>
                </section>
                <section>
                  <header className="flex items-center gap-2 text-[#0047CC] mb-4">
                    <Layers className="w-4 h-4" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Bank Presets
                    </h3>
                  </header>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTheme("hdfc");
                      applyIdfcPreset();
                      persist();
                    }}
                    className="w-full h-12 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 font-semibold"
                  >
                    Apply Mahindra Finance Preset
                  </Button>
                  <p className="text-xs text-slate-500 mt-2">
                    One-click optimise all 3 journeys (NTB, ETB, ETB-NK) for Mahindra Finance—branding, CTAs, legal text, support info.
                  </p>
                </section>
              </>
            )}

            {/* STEP 2: BRANDING */}
            {wizardStep === 2 && (
              <>
                <section>
                  <header className="flex items-center gap-2 text-[#0047CC] mb-4">
                    <Upload className="w-4 h-4" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Logo Upload
                    </h3>
                            </header>
                  <div className="flex items-center gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-white">
                      {journeyConfig.logoUrl ? (
                        <img
                          src={journeyConfig.logoUrl}
                          alt="Logo"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Image className="w-10 h-10 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-slate-200"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Logo
                      </Button>
                      {journeyConfig.extractedTheme && (
                        <Button
                          variant="outline"
                          onClick={applyExtractedTheme}
                          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        >
                          <Palette className="w-4 h-4 mr-2" />
                          Apply Theme from Logo
                        </Button>
                      )}
                      <p className="text-xs text-slate-500">
                        Upload your logo. Theme colours will be extracted automatically.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <header className="flex items-center gap-2 text-[#0047CC] mb-4">
                    <Palette className="w-4 h-4" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Color Palette
                    </h3>
                  </header>
                  <div className="flex gap-6">
                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-bold text-slate-600">Primary</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                          value={brandingConfig.primary}
                                            onChange={(e) => updateConfig({ primary: e.target.value })}
                                            className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0"
                                        />
                                        <input
                                            type="text"
                          value={brandingConfig.primary}
                                            onChange={(e) => updateConfig({ primary: e.target.value })}
                                            className="flex-1 h-12 px-4 rounded-xl border border-slate-200 font-mono text-sm uppercase"
                                        />
                                    </div>
                                </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-bold text-slate-600">Secondary</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                          value={brandingConfig.secondary}
                                            onChange={(e) => updateConfig({ secondary: e.target.value })}
                                            className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0"
                                        />
                                        <input
                                            type="text"
                          value={brandingConfig.secondary}
                                            onChange={(e) => updateConfig({ secondary: e.target.value })}
                                            className="flex-1 h-12 px-4 rounded-xl border border-slate-200 font-mono text-sm uppercase"
                                        />
                                    </div>
                                </div>
                            </div>
                </section>

                <section>
                  <header className="flex items-center gap-2 text-orange-600 mb-4">
                                <Square className="w-4 h-4" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Visual Geometry
                    </h3>
                            </header>
                  <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                        <label className="text-xs font-bold text-slate-600">Border Radius</label>
                        <span className="text-xs font-black text-slate-400">
                          {brandingConfig.borderRadius}px
                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="40"
                        value={brandingConfig.borderRadius}
                        onChange={(e) =>
                          updateConfig({ borderRadius: parseInt(e.target.value) })
                        }
                                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                                    />
                                </div>
                                    </div>
                </section>

                <section className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-700">Benefits Sidebar</span>
                                        <div
                        onClick={() =>
                          updateConfig({
                            modules: {
                              ...brandingConfig.modules,
                              showBenefits: !brandingConfig.modules.showBenefits,
                            },
                          })
                        }
                                            className={cn(
                                                "w-10 h-5 rounded-full transition-all cursor-pointer relative",
                          brandingConfig.modules.showBenefits ? "bg-blue-600" : "bg-slate-200"
                                            )}
                                        >
                        <div
                          className={cn(
                                                "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all",
                            brandingConfig.modules.showBenefits ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                                        </div>
                                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Toggle step-specific help sidebars.
                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-700">Security Badges</span>
                                        <div
                        onClick={() =>
                          updateConfig({
                            modules: {
                              ...brandingConfig.modules,
                              showSecurity: !brandingConfig.modules.showSecurity,
                            },
                          })
                        }
                                            className={cn(
                                                "w-10 h-5 rounded-full transition-all cursor-pointer relative",
                          brandingConfig.modules.showSecurity ? "bg-blue-600" : "bg-slate-200"
                                            )}
                                        >
                        <div
                          className={cn(
                                                "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all",
                            brandingConfig.modules.showSecurity ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                                        </div>
                                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Display RBI & trust visuals.
                    </p>
                                </div>
                </section>

                <section>
                  <header className="flex items-center gap-2 text-[#0047CC] mb-4">
                    <Palette className="w-4 h-4" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Font & Preset
                    </h3>
                  </header>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">Font Family</label>
                      <select
                        value={brandingConfig.fontFamily}
                        onChange={(e) =>
                          updateConfig({
                            fontFamily: e.target.value as "Open Sans" | "Inter" | "Poppins" | "Roboto" | "Plus Jakarta Sans",
                          })
                        }
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-medium"
                      >
                        <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Inter">Inter</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Roboto">Roboto</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">Visual Preset</label>
                      <div className="flex gap-2">
                        {["glassy", "neobrutalist", "minimal"].map((p) => (
                                            <button
                            key={p}
                            onClick={() =>
                              updateConfig({ preset: p as "glassy" | "neobrutalist" | "minimal" })
                            }
                                                className={cn(
                              "flex-1 py-3 rounded-xl text-sm font-semibold capitalize",
                              brandingConfig.preset === p
                                ? "bg-slate-900 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            )}
                          >
                            {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-xs font-bold text-slate-600">Glass Opacity</label>
                        <span className="text-xs font-black text-slate-400">
                          {Math.round(brandingConfig.glassOpacity * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={Math.round(brandingConfig.glassOpacity * 100)}
                        onChange={(e) =>
                          updateConfig({ glassOpacity: parseInt(e.target.value) / 100 })
                        }
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600">Header Size</label>
                        <select
                          value={brandingConfig.modules.headerSize}
                          onChange={(e) =>
                            updateConfig({
                              modules: {
                                ...brandingConfig.modules,
                                headerSize: e.target.value as "regular" | "large",
                              },
                            })
                          }
                          className="w-full h-10 px-4 rounded-xl border border-slate-200 text-sm"
                        >
                          <option value="regular">Regular</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600">Input Style</label>
                        <select
                          value={brandingConfig.modules.inputStyle}
                          onChange={(e) =>
                            updateConfig({
                              modules: {
                                ...brandingConfig.modules,
                                inputStyle: e.target.value as "filled" | "outline",
                              },
                            })
                          }
                          className="w-full h-10 px-4 rounded-xl border border-slate-200 text-sm"
                        >
                          <option value="filled">Filled</option>
                          <option value="outline">Outline</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* STEP 3: JOURNEY STRUCTURE */}
            {wizardStep === 3 && (
              <>
                <section>
                  <header className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <Layers className="w-4 h-4" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                        Pages & Steps
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadDefaultNtbJourney}
                        className="border-slate-200"
                      >
                        Load Default NTB
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadDefaultEtbJourney}
                        className="border-slate-200"
                      >
                        Load Default ETB
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadDefaultEtbNkJourney}
                        className="border-slate-200"
                      >
                        Load Default ETB-NK
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddStep}
                        className="border-slate-200"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Step
                      </Button>
                    </div>
                  </header>
                  <p className="text-xs text-slate-500 mb-4">
                    Drag to reorder. Add or remove steps to build your journey. Each step can have
                    custom fields with a data source (Bank API, Tartan API, or Manual).
                  </p>
                  <div className="space-y-2">
                    {journeyConfig.steps.length === 0 ? (
                      <div
                        onClick={handleAddStep}
                        className="p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center text-slate-400 hover:border-slate-300 hover:text-slate-500 cursor-pointer transition-colors"
                      >
                        <Layers className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-semibold">No steps yet</p>
                        <p className="text-xs">Click to add your first step</p>
                      </div>
                    ) : (
                      journeyConfig.steps.map((step, index) => (
                        <div
                          key={step.id}
                          draggable
                          onDragStart={() => setDraggedStepIndex(index)}
                          onDragEnd={() => setDraggedStepIndex(null)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (draggedStepIndex !== null && draggedStepIndex !== index) {
                              reorderSteps(draggedStepIndex, index);
                              setDraggedStepIndex(index);
                            }
                          }}
                          className={cn(
                            "rounded-xl border border-slate-200 bg-white overflow-hidden transition-all",
                            draggedStepIndex === index && "opacity-50"
                          )}
                        >
                          <div
                            className="flex items-center gap-3 p-4 cursor-pointer"
                            onClick={() =>
                              setExpandedStepIndex(expandedStepIndex === index ? null : index)
                            }
                          >
                            <GripVertical className="w-4 h-4 text-slate-300" />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-800 truncate">
                                {step.title || `Step ${index + 1}`}
                              </p>
                              <p className="text-xs text-slate-500">
                                {STEP_KINDS.find((s) => s.id === step.stepKind)?.label ||
                                  step.stepKind}{" "}
                                • {step.fields.length} fields
                              </p>
                            </div>
                                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeStep(index);
                              }}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <ChevronDown
                                                className={cn(
                                "w-4 h-4 text-slate-400 transition-transform",
                                expandedStepIndex === index && "rotate-180"
                              )}
                            />
                          </div>
                          {expandedStepIndex === index && (
                            <div className="px-4 pb-4 pt-4 border-t border-slate-100 space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-slate-600">
                                    Step Type
                                  </label>
                                  <select
                                    value={step.stepKind}
                                    onChange={(e) =>
                                      updateStep(index, {
                                        stepKind: e.target.value as StepKind,
                                        fields: getFieldsForStepKind(e.target.value as StepKind),
                                      })
                                    }
                                    className="w-full h-10 px-4 rounded-xl border border-slate-200 text-sm font-medium"
                                  >
                                    {STEP_KINDS.map((s) => (
                                      <option key={s.id} value={s.id}>
                                        {s.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-slate-600">
                                    Step Title
                                  </label>
                                  <input
                                    type="text"
                                    value={step.title}
                                    onChange={(e) =>
                                      updateStep(index, { title: e.target.value })
                                    }
                                    className="w-full h-10 px-4 rounded-xl border border-slate-200 text-sm"
                                    placeholder="e.g. Verify Details"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-slate-600">
                                    Fields & Data Source
                                  </label>
                                  <select
                                    className="h-8 px-3 rounded-lg border border-slate-200 text-xs font-medium"
                                    value=""
                                    onChange={(e) => {
                                      const id = e.target.value as FieldKind;
                                      if (!id) return;
                                      const newField: FieldConfig = {
                                        id,
                                        label: FIELD_KINDS.find((k) => k.id === id)?.label || id,
                                        source: "bank-api",
                                      };
                                      const next = [...step.fields, newField];
                                      updateStepFields(index, next);
                                      e.target.value = "";
                                    }}
                                  >
                                    <option value="">+ Add field</option>
                                    {FIELD_KINDS.filter(
                                      (k) => !step.fields.some((f) => f.id === k.id)
                                    ).map((k) => (
                                      <option key={k.id} value={k.id}>
                                        {k.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  {step.fields.map((field, fi) => (
                                    <div
                                      key={`${field.id}-${fi}`}
                                      className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100"
                                    >
                                      <div className="flex flex-col gap-0.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (fi === 0) return;
                                            const next = [...step.fields];
                                            [next[fi - 1], next[fi]] = [next[fi], next[fi - 1]];
                                            updateStepFields(index, next);
                                          }}
                                          className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                          disabled={fi === 0}
                                        >
                                          <ChevronUp className="w-4 h-4" />
                                            </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (fi === step.fields.length - 1) return;
                                            const next = [...step.fields];
                                            [next[fi], next[fi + 1]] = [next[fi + 1], next[fi]];
                                            updateStepFields(index, next);
                                          }}
                                          className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                          disabled={fi === step.fields.length - 1}
                                        >
                                          <ChevronDown className="w-4 h-4" />
                                        </button>
                                      </div>
                                      <input
                                        type="text"
                                        value={field.label}
                                        onChange={(e) => {
                                          const next = [...step.fields];
                                          next[fi] = { ...next[fi], label: e.target.value };
                                          updateStepFields(index, next);
                                        }}
                                        className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-sm font-medium"
                                        placeholder="Field name"
                                      />
                                      <select
                                        value={field.source}
                                        onChange={(e) => {
                                          const next = [...step.fields];
                                          next[fi] = {
                                            ...next[fi],
                                            source: e.target.value as DataSource,
                                          };
                                          updateStepFields(index, next);
                                        }}
                                        className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium"
                                      >
                                        <option value="bank-api">Bank API</option>
                                        <option value="tartan-api">Tartan API</option>
                                        <option value="manual">Manual</option>
                                      </select>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const next = step.fields.filter((_, i) => i !== fi);
                                          updateStepFields(index, next);
                                        }}
                                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                                        title="Remove field"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </>
            )}

            {/* STEP 4: FINE-TUNE - Fields, Modules, UX */}
            {wizardStep === 4 && (
              <>
            {/* FIELDS & SOURCES (enhanced: component type, API priority, prefill, validations) */}
            <section>
                <header className="flex items-center gap-2 text-indigo-600 mb-4">
                  <Square className="w-4 h-4" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Field Configuration
                  </h3>
                </header>
                <p className="text-xs text-slate-500 mb-4">
                  Configure each field: type (Input, Document Upload, API), data source, prefill behavior, and validations.
                </p>
                        <div className="space-y-4">
                  {journeyConfig.steps.map((step, si) => (
                    <div key={step.id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <h4 className="font-semibold text-slate-800 mb-3">{step.title}</h4>
                      {step.fields.length === 0 ? (
                        <p className="text-xs text-slate-400">No fields configured</p>
                      ) : (
                        <div className="space-y-3">
                          {step.fields.map((field, fi) => (
                            <FieldConfigCard
                              key={field.id}
                              field={field}
                              onUpdate={(updates) => {
                                const next = [...step.fields];
                                next[fi] = { ...next[fi], ...updates };
                                updateStepFields(si, next);
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {journeyConfig.steps.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-8">
                      Add steps in Journey Builder first to configure fields.
                    </p>
                  )}
                </div>
            </section>

            {/* MODULE PROVIDERS */}
                <section>
                  <header className="flex items-center gap-2 text-indigo-600 mb-4">
                                <Globe className="w-4 h-4" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Module Provider Selection
                    </h3>
                            </header>
                  <p className="text-xs text-slate-500 mb-4">
                    Choose Bank Modules, Tartan Modules, or 3rd Party Vendors for each capability.
                    For 3rd party, pick from the top providers.
                  </p>
                  <div className="space-y-4">
                    {journeyConfig.modules.map((mod) => (
                      <div
                        key={mod.moduleKind}
                        className="rounded-xl border border-slate-200 bg-white p-4 space-y-4"
                      >
                        <h4 className="font-semibold text-slate-800">
                          {MODULE_KINDS.find((m) => m.id === mod.moduleKind)?.label ||
                            mod.moduleKind}
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {(["bank", "tartan", "third-party"] as const).map((p) => (
                            <button
                              key={p}
                              onClick={() =>
                                updateModule(mod.moduleKind, {
                                  provider: p,
                                  ...(p !== "third-party" ? { thirdPartyVendor: undefined } : {}),
                                })
                              }
                                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                                mod.provider === p
                                  ? "bg-slate-900 text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              )}
                            >
                              {p === "bank"
                                ? "Bank Modules"
                                : p === "tartan"
                                ? "Tartan Modules"
                                : "3rd Party"}
                            </button>
                          ))}
                                        </div>
                        {mod.provider === "third-party" && (
                          <div className="pt-2 border-t border-slate-100">
                            <label className="text-xs font-bold text-slate-600 block mb-2">
                              Top 3 Vendors
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {(
                                THIRD_PARTY_VENDORS_BY_MODULE[mod.moduleKind] || []
                              ).map((v) => (
                                <button
                                  key={v}
                                  onClick={() =>
                                    updateModule(mod.moduleKind, {
                                      provider: "third-party",
                                      thirdPartyVendor: v,
                                    })
                                  }
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                    mod.thirdPartyVendor === v
                                      ? "bg-indigo-600 text-white"
                                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                  )}
                                >
                                  {VENDOR_LABELS[v]}
                                </button>
                              ))}
                                    </div>
                                </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

            {/* UX & FLOW */}
                <section>
                  <header className="flex items-center gap-2 text-indigo-600 mb-4">
                    <Sparkles className="w-4 h-4" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Guidance Philosophy
                    </h3>
                  </header>
                  <p className="text-xs text-slate-500 mb-4">
                    Like a herder guiding a flock—soft, directional, never forcing. The journey
                    guides users naturally to the next step.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600">Guidance Style</label>
                      <div className="flex gap-2 mt-2 p-1 bg-slate-50 rounded-xl">
                        {(
                          [
                            {
                              id: "herder",
                              label: "Herder",
                              desc: "Soft nudges, gentle direction",
                            },
                            {
                              id: "guided",
                              label: "Guided",
                              desc: "Clear step-by-step",
                            },
                            {
                              id: "minimal",
                              label: "Minimal",
                              desc: "Bare essentials",
                            },
                          ] as const
                        ).map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => updateUx({ guidanceStyle: opt.id })}
                                            className={cn(
                              "flex-1 p-4 rounded-lg text-left transition-all",
                              journeyConfig.ux.guidanceStyle === opt.id
                                ? "bg-white shadow-md border border-slate-200"
                                : "hover:bg-slate-100"
                            )}
                          >
                            <p className="font-semibold text-slate-800">{opt.label}</p>
                            <p className="text-xs text-slate-500 mt-1">{opt.desc}</p>
                          </button>
                        ))}
                                        </div>
                                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600">CTA Style</label>
                      <div className="flex gap-2 mt-2">
                        {["soft", "prominent", "minimal"].map((s) => (
                                            <button
                                                key={s}
                            onClick={() => updateUx({ ctaStyle: s as any })}
                                                className={cn(
                              "flex-1 py-2 rounded-xl text-sm font-semibold",
                              journeyConfig.ux.ctaStyle === s
                                ? "bg-slate-900 text-white"
                                : "bg-slate-100 text-slate-600"
                                                )}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600">Progress Style</label>
                      <div className="flex gap-2 mt-2">
                        {["linear", "steps", "minimal", "hidden"].map((s) => (
                                            <button
                                                key={s}
                            onClick={() => updateUx({ progressStyle: s as any })}
                                                className={cn(
                              "flex-1 py-2 rounded-xl text-sm font-semibold",
                              journeyConfig.ux.progressStyle === s
                                ? "bg-slate-900 text-white"
                                : "bg-slate-100 text-slate-600"
                                                )}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                </section>

                <section>
                  <header className="flex items-center gap-2 text-slate-600 mb-4">
                    <Zap className="w-4 h-4" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Flow Preferences
                    </h3>
                  </header>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: "showExitIntent", label: "Exit Intent Prompt" },
                      { key: "allowSaveResume", label: "Save & Resume" },
                      { key: "nudgeEnabled", label: "Nudge Reminders" },
                      { key: "showEstimatedTime", label: "Estimated Time" },
                      { key: "allowBackNavigation", label: "Back Navigation" },
                    ].map(({ key, label }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <span className="text-sm font-medium text-slate-700">{label}</span>
                        <div
                          onClick={() =>
                            updateUx({
                              [key]: !(journeyConfig.ux as any)[key],
                            } as any)
                          }
                          className={cn(
                            "w-10 h-5 rounded-full transition-all cursor-pointer relative",
                            (journeyConfig.ux as any)[key] ? "bg-blue-600" : "bg-slate-200"
                          )}
                        >
                          <div
                            className={cn(
                              "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all",
                              (journeyConfig.ux as any)[key] ? "translate-x-5" : "translate-x-0"
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <header className="flex items-center gap-2 text-slate-600 mb-4">
                    <MessageCircle className="w-4 h-4" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Microcopy Tone
                    </h3>
                            </header>
                  <div className="flex gap-2">
                    {["formal", "friendly", "conversational"].map((t) => (
                      <button
                        key={t}
                        onClick={() => updateUx({ microcopyTone: t as any })}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-sm font-semibold capitalize",
                          journeyConfig.ux.microcopyTone === t
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </section>

                {/* CTA Labels */}
                <section>
                  <header className="flex items-center gap-2 text-indigo-600 mb-4">
                    <Type className="w-4 h-4" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                      CTA Labels
                    </h3>
                  </header>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: "continue" as const, label: "Continue" },
                      { key: "submit" as const, label: "Submit" },
                      { key: "verifyOtp" as const, label: "Verify OTP" },
                      { key: "getOtp" as const, label: "Get OTP" },
                      { key: "verifyAadhaar" as const, label: "Verify Aadhaar" },
                      { key: "proceedToVideoKyc" as const, label: "Proceed to Video KYC" },
                      { key: "submitApplication" as const, label: "Submit Application" },
                      { key: "confirmAndContinue" as const, label: "Confirm & Continue" },
                      { key: "imDone" as const, label: "I'm done (skip Video KYC)" },
                      { key: "back" as const, label: "Back" },
                    ].map(({ key, label }) => (
                      <div key={key} className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">{label}</label>
                        <input
                          type="text"
                          value={journeyConfig.ctaLabels[key] ?? ""}
                          onChange={(e) => updateCtaLabels({ [key]: e.target.value })}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Step Titles */}
                <section>
                  <header className="flex items-center gap-2 text-indigo-600 mb-4">
                    <Layers className="w-4 h-4" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Step Titles
                    </h3>
                  </header>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: "welcome" as const, label: "Welcome" },
                      { key: "profileDetails" as const, label: "Profile Details" },
                      { key: "autoConversion" as const, label: "Auto Conversion" },
                      { key: "videoKyc" as const, label: "Video KYC" },
                      { key: "reviewApplication" as const, label: "Review Application" },
                      { key: "complete" as const, label: "Complete" },
                    ].map(({ key, label }) => (
                      <div key={key} className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">{label}</label>
                        <input
                          type="text"
                          value={journeyConfig.stepTitles[key]}
                          onChange={(e) => updateStepTitles({ [key]: e.target.value })}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Legal & Consent */}
                <section>
                  <header className="flex items-center gap-2 text-indigo-600 mb-4">
                    <FileText className="w-4 h-4" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Legal & Consent
                    </h3>
                  </header>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Terms Title</label>
                      <input
                        type="text"
                        value={journeyConfig.legalTexts.termsTitle}
                        onChange={(e) => updateLegalTexts({ termsTitle: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Terms Description</label>
                      <input
                        type="text"
                        value={journeyConfig.legalTexts.termsDescription}
                        onChange={(e) => updateLegalTexts({ termsDescription: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Privacy Title</label>
                      <input
                        type="text"
                        value={journeyConfig.legalTexts.privacyTitle}
                        onChange={(e) => updateLegalTexts({ privacyTitle: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">VKYC Present in India</label>
                      <input
                        type="text"
                        value={journeyConfig.legalTexts.vkycPresentInIndia}
                        onChange={(e) => updateLegalTexts({ vkycPresentInIndia: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Company Portal Consent (optional)</label>
                      <input
                        type="text"
                        value={journeyConfig.legalTexts.companyPortalConsent ?? ""}
                        onChange={(e) => updateLegalTexts({ companyPortalConsent: e.target.value || undefined })}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
                        placeholder="I consent to fetch my data from my company portal..."
                      />
                    </div>
                  </div>
                </section>

                {/* Journey Flow */}
                <section>
                  <header className="flex items-center gap-2 text-indigo-600 mb-4">
                    <Zap className="w-4 h-4" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Journey Flow
                    </h3>
                  </header>
                  <p className="text-xs text-slate-500 mb-3">
                    Welcome page and pre-approved offers.
                  </p>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={journeyConfig.prefillOnConsent !== false}
                        onChange={(e) => updateJourneyConfig({ prefillOnConsent: e.target.checked })}
                        className="rounded border-slate-300"
                      />
                      <span className="text-sm text-slate-700">Prefill journey when user consents to company portal data</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={journeyConfig.showPreApprovedOffersBeforeVideoKyc !== false}
                        onChange={(e) => updateJourneyConfig({ showPreApprovedOffersBeforeVideoKyc: e.target.checked })}
                        className="rounded border-slate-300"
                      />
                      <span className="text-sm text-slate-700">Show pre-approved offers page before Video KYC</span>
                    </label>
                  </div>
                </section>

                {/* Field Options (dropdowns) */}
                <section>
                  <header className="flex items-center gap-2 text-indigo-600 mb-4">
                    <Square className="w-4 h-4" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Dropdown Options
                    </h3>
                  </header>
                  <p className="text-xs text-slate-500 mb-3">
                    Options for income range and marital status fields.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-2">
                        Income Range
                      </label>
                      <div className="space-y-2">
                        {journeyConfig.fieldOptions.incomeRange.map((opt, i) => (
                          <div key={i} className="flex gap-2">
                            <input
                              type="text"
                              value={opt.value}
                              onChange={(e) => {
                                const next = [...journeyConfig.fieldOptions.incomeRange];
                                next[i] = { ...next[i], value: e.target.value };
                                updateFieldOptions({ incomeRange: next });
                              }}
                              placeholder="value"
                              className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-sm"
                            />
                            <input
                              type="text"
                              value={opt.label}
                              onChange={(e) => {
                                const next = [...journeyConfig.fieldOptions.incomeRange];
                                next[i] = { ...next[i], label: e.target.value };
                                updateFieldOptions({ incomeRange: next });
                              }}
                              placeholder="label"
                              className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-sm"
                            />
                        </div>
                        ))}
                    </div>
                </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-2">
                        Marital Status
                      </label>
                      <div className="space-y-2">
                        {journeyConfig.fieldOptions.maritalStatus.map((opt, i) => (
                          <div key={i} className="flex gap-2">
                            <input
                              type="text"
                              value={opt.value}
                              onChange={(e) => {
                                const next = [...journeyConfig.fieldOptions.maritalStatus];
                                next[i] = { ...next[i], value: e.target.value };
                                updateFieldOptions({ maritalStatus: next });
                              }}
                              placeholder="value"
                              className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-sm"
                            />
                            <input
                              type="text"
                              value={opt.label}
                              onChange={(e) => {
                                const next = [...journeyConfig.fieldOptions.maritalStatus];
                                next[i] = { ...next[i], label: e.target.value };
                                updateFieldOptions({ maritalStatus: next });
                              }}
                              placeholder="label"
                              className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Error Messages */}
                <section>
                  <header className="flex items-center gap-2 text-indigo-600 mb-4">
                    <Zap className="w-4 h-4" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Error Messages
                    </h3>
                  </header>
                  <div className="space-y-3">
                    {[
                      { key: "consentRequired" as const, label: "Consent Required" },
                      { key: "consentBothRequired" as const, label: "Both Consents Required" },
                      { key: "requiredField" as const, label: "Required Field" },
                    ].map(({ key, label }) => (
                      <div key={key} className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">{label}</label>
                        <input
                          type="text"
                          value={journeyConfig.errorMessages[key]}
                          onChange={(e) => updateErrorMessages({ [key]: e.target.value })}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Support */}
                <section>
                  <header className="flex items-center gap-2 text-indigo-600 mb-4">
                    <HelpCircle className="w-4 h-4" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Support
                    </h3>
                  </header>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Help Tooltip</label>
                      <input
                        type="text"
                        value={journeyConfig.support.helpTooltip}
                        onChange={(e) => updateSupport({ helpTooltip: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Support URL</label>
                      <input
                        type="url"
                        value={journeyConfig.support.supportUrl}
                        onChange={(e) => updateSupport({ supportUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">FAQ URL</label>
                      <input
                        type="url"
                        value={journeyConfig.support.faqUrl}
                        onChange={(e) => updateSupport({ faqUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
                      />
                    </div>
                  </div>
                </section>

                {/* Config Import */}
                <section>
                  <header className="flex items-center gap-2 text-indigo-600 mb-4">
                    <FileUp className="w-4 h-4" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Import Config
                    </h3>
                  </header>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        try {
                          importConfig(reader.result as string);
                        } catch (err) {
                          alert("Invalid config JSON. Please check the file format.");
                        }
                      };
                      reader.readAsText(file);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => importInputRef.current?.click()}
                    className="border-slate-200"
                  >
                    <FileUp className="w-4 h-4 mr-2" />
                    Import from JSON
                  </Button>
                  <p className="text-xs text-slate-500 mt-2">
                    Load a previously exported journey config.
                  </p>
                </section>
              </>
            )}
          </div>
        </div>

        {/* Footer - Wizard navigation */}
        <div className="p-8 border-t border-slate-100 flex items-center justify-between gap-4 bg-slate-50/30 shrink-0">
          <div className="flex items-center gap-3">
            {wizardStep > 1 ? (
              <Button variant="outline" onClick={() => setWizardStep((wizardStep - 1) as WizardStep)}>
                Back
              </Button>
            ) : (
              <div />
            )}
            {wizardStep < 4 ? (
              <Button onClick={() => setWizardStep((wizardStep + 1) as WizardStep)}>
                Next
              </Button>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
                    <button
              onClick={() => {
                resetToDefaults();
                updateConfig({});
              }}
                        className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                    >
                        <RotateCcw className="w-3 h-3" />
              Reset
                    </button>
                    <Button
              variant="outline"
              size="sm"
              onClick={() => {
                persist();
                setHasUnsavedChanges(false);
              }}
              className="border-slate-200"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Config
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const blob = new Blob(
                  [JSON.stringify(journeyConfig, null, 2)],
                  { type: "application/json" }
                );
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "journey-config.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="border-slate-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Config
            </Button>
          </div>
          <Button
            onClick={() => {
              persist();
              setHasUnsavedChanges(false);
              onClose();
            }}
                        className="h-12 px-8 rounded-2xl bg-slate-900 text-white font-black hover:bg-black transition-all active:scale-95"
                    >
            Apply & Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
