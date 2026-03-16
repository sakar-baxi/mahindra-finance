"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";

/* =============================================================================
   JOURNEY CONFIGURATION - Modular Building Block System
   Clients can configure every aspect of the salary account opening journey.
   ============================================================================= */

export type DataSource = "bank-api" | "tartan-api" | "manual";

export type ModuleProvider = "bank" | "tartan" | "third-party";

export type ThirdPartyVendor =
  | "diginet"
  | "karza"
  | "signzy"
  | "au10tix"
  | "veriff"
  | "onfido"
  | "sms-country"
  | "msg91"
  | "twilio";

export type ModuleKind =
  | "aadhaar-kyc"
  | "video-kyc"
  | "otp-verification"
  | "pan-verification"
  | "income-verification"
  | "address-verification"
  | "document-upload"
  | "account-verification"
  | "nominee-management";

export const MODULE_KINDS: { id: ModuleKind; label: string }[] = [
  { id: "aadhaar-kyc", label: "Aadhaar eKYC" },
  { id: "video-kyc", label: "Video KYC" },
  { id: "otp-verification", label: "OTP Verification" },
  { id: "pan-verification", label: "PAN Verification" },
  { id: "income-verification", label: "Income Verification" },
  { id: "address-verification", label: "Address Verification" },
  { id: "document-upload", label: "Document Upload" },
  { id: "account-verification", label: "Account Verification" },
  { id: "nominee-management", label: "Nominee Management" },
];

export const THIRD_PARTY_VENDORS_BY_MODULE: Record<ModuleKind, ThirdPartyVendor[]> = {
  "aadhaar-kyc": ["diginet", "karza", "signzy"],
  "video-kyc": ["au10tix", "veriff", "onfido"],
  "otp-verification": ["sms-country", "msg91", "twilio"],
  "pan-verification": ["karza", "diginet", "signzy"],
  "income-verification": ["karza", "signzy", "diginet"],
  "address-verification": ["karza", "diginet", "signzy"],
  "document-upload": ["signzy", "au10tix", "veriff"],
  "account-verification": ["karza", "diginet", "signzy"],
  "nominee-management": ["karza", "signzy", "diginet"],
};

export const VENDOR_LABELS: Record<ThirdPartyVendor, string> = {
  diginet: "Diginet",
  karza: "Karza Technologies",
  signzy: "Signzy",
  au10tix: "Au10tix",
  veriff: "Veriff",
  onfido: "Onfido",
  "sms-country": "SMS Country",
  msg91: "MSG91",
  twilio: "Twilio",
};

export type StepKind =
  | "welcome"
  | "ekycHandler"
  | "profileDetails"
  | "kycChoice"
  | "physicalKyc"
  | "reviewApplication"
  | "videoKyc"
  | "autoConversion"
  | "etbIncomeDeclarations"
  | "conversionVerification"
  | "complete"
  | "preApprovedOffers"
  | "nomineeDetails"
  | "incomeDetails"
  | "etbKycProfile"
  | "custom";

export const STEP_KINDS: { id: StepKind; label: string }[] = [
  { id: "welcome", label: "Welcome / OTP" },
  { id: "kycChoice", label: "KYC Type Selection" },
  { id: "ekycHandler", label: "Aadhaar eKYC" },
  { id: "physicalKyc", label: "Physical KYC" },
  { id: "profileDetails", label: "Profile Details (YOUR)" },
  { id: "incomeDetails", label: "Income Details" },
  { id: "etbIncomeDeclarations", label: "Income & Declarations" },
  { id: "nomineeDetails", label: "Nominee Details" },
  { id: "reviewApplication", label: "Review Application" },
  { id: "videoKyc", label: "Video KYC" },
  { id: "autoConversion", label: "Account Conversion" },
  { id: "conversionVerification", label: "Conversion Verification" },
  { id: "etbKycProfile", label: "ETB KYC Profile" },
  { id: "complete", label: "Complete" },
  { id: "preApprovedOffers", label: "Pre-approved Offers (before VKYC)" },
  { id: "custom", label: "Custom Step" },
];

export type FieldKind =
  | "name"
  | "mobileNumber"
  | "email"
  | "dob"
  | "pan"
  | "aadhaarNumber"
  | "fatherName"
  | "motherName"
  | "maritalStatus"
  | "incomeRange"
  | "grossAnnualIncome"
  | "occupation"
  | "sourceOfIncome"
  | "permanentAddress"
  | "communicationAddress"
  | "nomineeInfo"
  | "declarations"
  | "consents"
  | "employmentDetails"
  | "accountSelection"
  | "otp"
  | "documentUpload"
  | "profileDetails";

export const FIELD_KINDS: { id: FieldKind; label: string }[] = [
  { id: "name", label: "Full Name" },
  { id: "mobileNumber", label: "Mobile Number" },
  { id: "email", label: "Email" },
  { id: "dob", label: "Date of Birth" },
  { id: "pan", label: "PAN" },
  { id: "aadhaarNumber", label: "12-digit Aadhaar number" },
  { id: "fatherName", label: "Father's Name" },
  { id: "motherName", label: "Mother's Name" },
  { id: "maritalStatus", label: "Marital Status" },
  { id: "incomeRange", label: "Income Range" },
  { id: "grossAnnualIncome", label: "Gross annual income (₹)" },
  { id: "occupation", label: "Occupation" },
  { id: "sourceOfIncome", label: "Source of income" },
  { id: "permanentAddress", label: "Permanent Address" },
  { id: "communicationAddress", label: "Communication Address" },
  { id: "nomineeInfo", label: "Nominee Information" },
  { id: "declarations", label: "Regulatory Declarations" },
  { id: "consents", label: "Consents (T&C, Privacy)" },
  { id: "employmentDetails", label: "Employment Details" },
  { id: "accountSelection", label: "Account Selection" },
  { id: "otp", label: "OTP Verification" },
  { id: "documentUpload", label: "Document Upload" },
  { id: "profileDetails", label: "Profile Details" },
];

/** API priority for field data: Main (primary), Fallback (backup), Additional (supplementary) */
export type ApiPriority = "main" | "fallback" | "additional";

export interface ApiConfig {
  apiId?: string;
  apiName?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH";
  responsePath?: string; // JSON path e.g. "data.name"
}

export type FieldComponentType = "input" | "documentUpload" | "api";

export type InputFieldType = "string" | "number" | "date" | "email" | "phone" | "pan" | "aadhaar" | "dropdown";

export type PrefillMode = "manual" | "prefill" | "prefillEditable" | "prefillReadOnly";

export interface ValidationRule {
  type: "required" | "minLength" | "maxLength" | "regex" | "email" | "min" | "max" | "fileType" | "fileSize";
  value?: string | number;
  message?: string;
}

export interface FieldConfig {
  id: FieldKind;
  label: string;
  source: DataSource;
  required?: boolean;
  order?: number;
  /** Component type: input, document upload, or API-driven */
  componentType?: FieldComponentType;
  /** For input: string, number, date, email, phone, pan, aadhaar, dropdown */
  inputType?: InputFieldType;
  /** Prefill: manual, prefill, prefillEditable, prefillReadOnly */
  prefillMode?: PrefillMode;
  /** Priority-ordered APIs: Main (1st), Fallback (2nd), Additional (3rd) */
  apiConfig?: {
    main?: ApiConfig;
    fallback?: ApiConfig;
    additional?: ApiConfig[];
  };
  /** Validation rules */
  validations?: ValidationRule[];
  /** Placeholder text */
  placeholder?: string;
  /** Document upload: allowed types (PDF, JPG, etc.) */
  allowedFileTypes?: string[];
  /** Document upload: max size in MB */
  maxFileSizeMb?: number;
  /** Document upload: instructions */
  uploadInstructions?: string;
}

/** Section: logical grouping of fields within a page */
export interface SectionConfig {
  id: string;
  heading: string;
  subheading?: string;
  order: number;
  fieldIds: string[]; // References to field ids in parent step
}

export interface StepConfig {
  id: string;
  stepKind: StepKind;
  title: string;
  fields: FieldConfig[];
  order: number;
  /** Optional sections for grouping fields within this page */
  sections?: SectionConfig[];
}

export interface ModuleConfig {
  moduleKind: ModuleKind;
  provider: ModuleProvider;
  thirdPartyVendor?: ThirdPartyVendor;
}

export type GuidanceStyle = "herder" | "guided" | "minimal";
export type CtaStyle = "soft" | "prominent" | "minimal";
export type ProgressStyle = "linear" | "steps" | "minimal" | "hidden";

export interface UxPreferences {
  guidanceStyle: GuidanceStyle;
  ctaStyle: CtaStyle;
  progressStyle: ProgressStyle;
  showExitIntent: boolean;
  allowSaveResume: boolean;
  nudgeEnabled: boolean;
  nudgeDelayMinutes: number;
  microcopyTone: "formal" | "friendly" | "conversational";
  mobileFirst: boolean;
  showEstimatedTime: boolean;
  allowBackNavigation: boolean;
}

export type JourneyMode = "conversational" | "form";

export interface CtaLabels {
  continue: string;
  submit: string;
  verifyOtp: string;
  proceedToVideoKyc: string;
  submitApplication: string;
  confirmAndContinue: string;
  back: string;
  getOtp?: string;
  verifyAadhaar?: string;
  proceedToOpenAccount?: string;
  okay?: string;
  imDone?: string;
}

export interface StepTitles {
  welcome: string;
  profileDetails: string;
  autoConversion: string;
  videoKyc: string;
  reviewApplication: string;
  complete: string;
  preApprovedOffers?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  enterDetailsTitle?: string;
  professionalDetailsTitle?: string;
  selectAccountVariant?: string;
  addNominee?: string;
  disclaimer?: string;
  [key: string]: string | undefined;
}

export interface LegalTexts {
  termsTitle: string;
  termsDescription: string;
  privacyTitle: string;
  vkycConsent: string[];
  vkycPresentInIndia: string;
  aadhaarConsent?: string;
  companyPortalConsent?: string;
  nomineeDisclaimer?: string;
  kycDisclaimer?: string;
  taxResidentDisclaimer?: string;
}

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldOptionsConfig {
  incomeRange: FieldOption[];
  maritalStatus: FieldOption[];
  occupation?: FieldOption[];
  sourceOfIncome?: FieldOption[];
}

export interface ErrorMessages {
  consentRequired: string;
  consentBothRequired: string;
  requiredField: string;
  otpValidationFailed?: string;
  otpValidationGuidance?: string;
}

export interface SupportConfig {
  helpTooltip: string;
  supportUrl: string;
  faqUrl: string;
  supportPhone?: string;
}

export type StepFieldLayout = Record<StepKind, FieldConfig[]>;

export interface JourneyConfigState {
  journeyId: string;
  journeyName: string;
  bankName: string;
  journeyMode: JourneyMode;
  offerJourneyModeChoice: boolean;
  steps: StepConfig[];
  modules: ModuleConfig[];
  ux: UxPreferences;
  logoUrl: string | null;
  extractedTheme: {
    primary: string;
    secondary: string;
    accent: string;
  } | null;
  ctaLabels: CtaLabels;
  stepTitles: StepTitles;
  legalTexts: LegalTexts;
  fieldOptions: FieldOptionsConfig;
  errorMessages: ErrorMessages;
  support: SupportConfig;
  /** When set, step components render fields in this order; omit to hide. */
  stepFieldLayouts?: Partial<StepFieldLayout>;
  /** If true, prefill journey from company portal when user gives consent on welcome. */
  prefillOnConsent?: boolean;
  /** If true, show pre-approved offers page just before Video KYC (cross-sell). */
  showPreApprovedOffersBeforeVideoKyc?: boolean;
  /** Ordered base step IDs per journey type. When set, overrides default flow. e.g. { ntb: ["welcome","kycChoice","profileDetails",...] } */
  journeyStepOrder?: Record<string, string[]>;
}

const DEFAULT_UX: UxPreferences = {
  guidanceStyle: "herder",
  ctaStyle: "soft",
  progressStyle: "steps",
  showExitIntent: true,
  allowSaveResume: true,
  nudgeEnabled: true,
  nudgeDelayMinutes: 5,
  microcopyTone: "friendly",
  mobileFirst: true,
  showEstimatedTime: true,
  allowBackNavigation: true,
};

const DEFAULT_CTA_LABELS: CtaLabels = {
  continue: "Continue",
  submit: "Submit Application",
  verifyOtp: "Verify & Continue",
  proceedToVideoKyc: "Continue to Video KYC",
  submitApplication: "Submit Application",
  confirmAndContinue: "Confirm & Continue",
  back: "Back",
};

const DEFAULT_STEP_TITLES: StepTitles = {
  welcome: "Verification",
  profileDetails: "Your Details",
  autoConversion: "Convert to Salary Account",
  videoKyc: "Video KYC",
  reviewApplication: "Review Application",
  complete: "Submitted",
};

const DEFAULT_LEGAL_TEXTS: LegalTexts = {
  termsTitle: "Terms and Conditions",
  termsDescription: "Please review carefully to understand your rights and the security of your data.",
  privacyTitle: "Privacy Policy",
  vkycConsent: [
    "I consent to complete KYC through VCIP (Video Customer Identification Process) as prescribed by RBI.",
    "I authorize the Bank to open my account using Aadhaar OTP-based e-KYC if Video KYC is unsuccessful.",
    "I declare that I have completed the application myself and on my device.",
  ],
  vkycPresentInIndia: "I confirm that I am present in India.",
};

const DEFAULT_FIELD_OPTIONS: FieldOptionsConfig = {
  incomeRange: [
    { value: "0-5L", label: "Up to ₹5L" },
    { value: "5-10L", label: "₹5L – ₹10L" },
    { value: "10-15L", label: "₹10L – ₹15L" },
    { value: "15-25L", label: "₹15L – ₹25L" },
    { value: "25L+", label: "₹25L+" },
  ],
  maritalStatus: [
    { value: "single", label: "Single" },
    { value: "married", label: "Married" },
    { value: "divorced", label: "Divorced" },
    { value: "widowed", label: "Widowed" },
  ],
  occupation: [
    { value: "salaried", label: "Salaried Employee" },
    { value: "self-employed", label: "Self Employed" },
    { value: "professional", label: "Business Professional" },
    { value: "student", label: "Student / Other" },
  ],
  sourceOfIncome: [
    { value: "salary", label: "Salary" },
    { value: "business", label: "Business" },
    { value: "investments", label: "Investments" },
    { value: "other", label: "Other" },
  ],
};

const DEFAULT_ERROR_MESSAGES: ErrorMessages = {
  consentRequired: "This consent is mandatory.",
  consentBothRequired: "Both consents are required.",
  requiredField: "This field is required.",
};

const DEFAULT_SUPPORT: SupportConfig = {
  helpTooltip: "Need help? Click for more information.",
  supportUrl: "",
  faqUrl: "",
};

/* Mahindra Finance preset - optimised for all 3 journeys (NTB, ETB, ETB-NK) */
export const IDFC_JOURNEY_PRESET: Partial<JourneyConfigState> = {
  bankName: "Mahindra Finance",
  journeyName: "Mahindra Finance Savings Account",
  ctaLabels: {
    ...DEFAULT_CTA_LABELS,
    continue: "Continue",
    verifyOtp: "Verify & Continue",
    getOtp: "Get OTP To Verify Aadhaar",
    verifyAadhaar: "Verify Aadhaar",
    proceedToOpenAccount: "Proceed to open account",
    proceedToVideoKyc: "Continue to Video KYC",
    submitApplication: "Submit Application",
    confirmAndContinue: "Confirm & Continue",
    okay: "Okay",
  },
  stepTitles: {
    ...DEFAULT_STEP_TITLES,
    welcome: "Enter details to start your savings journey now!",
    heroTitle: "Get Interest Credited Every Month",
    heroSubtitle: "With your Mahindra Finance Savings Account",
    enterDetailsTitle: "Enter details to start your savings journey now!",
    profileDetails: "Please enter your Professional & Personal details",
    professionalDetailsTitle: "Please enter your Professional & Personal details",
    selectAccountVariant: "Select your Account Variant",
    addNominee: "You want to add a Nominee?",
    disclaimer: "Disclaimer",
    autoConversion: "Convert to Salary Account",
    videoKyc: "Video KYC",
    reviewApplication: "Review Application",
    complete: "Submitted",
  },
  legalTexts: {
    ...DEFAULT_LEGAL_TEXTS,
    aadhaarConsent:
      "By proceeding I allow Mahindra Finance to use my Aadhaar to fetch KYC details from UIDAI, fetch CIBIL report from TransUnion CIBIL and give consent to the bank to contact me via Call, SMS, Email and WhatsApp. This consent overrides any registration for DNC/NDNC.",
    nomineeDisclaimer:
      "In event of account holder's death, the amount of deposit in the account will be returned to the nominee by Mahindra Finance Ltd.",
    kycDisclaimer:
      "I confirm that I will complete full KYC within 30 days. In case of failure in doing so, bank reserves a right to initiate closure of my savings account.",
    taxResidentDisclaimer:
      "I accept all terms & conditions related to Mahindra Finance and confirm that I am citizen of only India, born in India and a tax resident of India only. Additionally, I confirm that I am not a politically exposed person nor related to one. For any change, I will visit the nearest branch and update my details.",
    companyPortalConsent:
      "I consent to fetch my data from my company portal to prefill this application. If I do not consent, I will enter all details manually.",
  },
  prefillOnConsent: true,
  showPreApprovedOffersBeforeVideoKyc: true,
  fieldOptions: {
    ...DEFAULT_FIELD_OPTIONS,
    occupation: [
      { value: "salaried", label: "Salaried Employee" },
      { value: "self-employed", label: "Self Employed" },
      { value: "professional", label: "Business Professional" },
      { value: "student", label: "Student / Other" },
    ],
    sourceOfIncome: [
      { value: "salary", label: "Salary" },
      { value: "business", label: "Business" },
      { value: "investments", label: "Investments" },
      { value: "other", label: "Other" },
    ],
  },
  errorMessages: {
    ...DEFAULT_ERROR_MESSAGES,
    otpValidationFailed: "Your OTP validation could not be completed",
    otpValidationGuidance:
      "Please try again after some time to open a new savings account. You may visit your nearest branch or call us on 180 010 888 to contact our bank representative for further assistance. Thank you for showing interest in our savings bank account.",
  },
  support: {
    ...DEFAULT_SUPPORT,
    supportPhone: "180 010 888",
    helpTooltip: "Need help? Call us on 180 010 888",
  },
  stepFieldLayouts: {
    welcome: [
      { id: "name", label: "Full Name", source: "bank-api" },
      { id: "mobileNumber", label: "Mobile Number", source: "bank-api" },
    ],
    profileDetails: [
      { id: "motherName", label: "Mother's full name", source: "bank-api" },
      { id: "fatherName", label: "Father's Name", source: "bank-api" },
      { id: "email", label: "Email address", source: "bank-api" },
      { id: "maritalStatus", label: "Marital Status", source: "manual" },
      { id: "permanentAddress", label: "Permanent Address", source: "bank-api" },
      { id: "communicationAddress", label: "Communication Address", source: "manual" },
      { id: "nomineeInfo", label: "Nominee", source: "manual" },
      { id: "declarations", label: "Disclaimer", source: "manual" },
      { id: "consents", label: "Consents", source: "bank-api" },
    ],
    ekycHandler: [
      { id: "aadhaarNumber", label: "12-digit Aadhaar number", source: "bank-api" },
      { id: "otp", label: "Aadhaar OTP", source: "bank-api" },
      { id: "consents", label: "UIDAI Consent", source: "bank-api" },
    ],
    autoConversion: [{ id: "accountSelection", label: "Select account to convert", source: "bank-api" }],
    reviewApplication: [{ id: "consents", label: "Terms & Conditions", source: "bank-api" }],
    etbIncomeDeclarations: [
      { id: "incomeRange", label: "Income Range", source: "manual" },
      { id: "declarations", label: "Disclaimer", source: "manual" },
      { id: "consents", label: "Consents", source: "bank-api" },
    ],
  },
};

const DEFAULT_JOURNEY_CONFIG: JourneyConfigState = {
  journeyId: "default",
  journeyName: IDFC_JOURNEY_PRESET.journeyName ?? "Mahindra Finance Savings Account",
  bankName: IDFC_JOURNEY_PRESET.bankName ?? "Mahindra Finance",
  journeyMode: "form",
  offerJourneyModeChoice: true,
  steps: [],
  modules: MODULE_KINDS.map((m) => ({
    moduleKind: m.id,
    provider: "bank" as ModuleProvider,
  })),
  ux: DEFAULT_UX,
  logoUrl: null,
  extractedTheme: null,
  ctaLabels: { ...DEFAULT_CTA_LABELS, ...IDFC_JOURNEY_PRESET.ctaLabels },
  stepTitles: { ...DEFAULT_STEP_TITLES, ...IDFC_JOURNEY_PRESET.stepTitles } as StepTitles,
  legalTexts: { ...DEFAULT_LEGAL_TEXTS, ...IDFC_JOURNEY_PRESET.legalTexts },
  fieldOptions: { ...DEFAULT_FIELD_OPTIONS, ...IDFC_JOURNEY_PRESET.fieldOptions } as FieldOptionsConfig,
  errorMessages: { ...DEFAULT_ERROR_MESSAGES, ...IDFC_JOURNEY_PRESET.errorMessages },
  support: { ...DEFAULT_SUPPORT, ...IDFC_JOURNEY_PRESET.support },
  stepFieldLayouts: IDFC_JOURNEY_PRESET.stepFieldLayouts,
  prefillOnConsent: IDFC_JOURNEY_PRESET.prefillOnConsent ?? true,
  showPreApprovedOffersBeforeVideoKyc: IDFC_JOURNEY_PRESET.showPreApprovedOffersBeforeVideoKyc ?? true,
};

const STORAGE_KEY = "journey_config_v1";

/** Welcome step must only show name and mobile number for all journey types (NTB, ETB, ETB-NK). */
const WELCOME_LAYOUT_ONLY_NAME_MOBILE: FieldConfig[] = [
  { id: "name", label: "Full Name", source: "bank-api" },
  { id: "mobileNumber", label: "Mobile Number", source: "bank-api" },
];

interface JourneyConfigContextType {
  config: JourneyConfigState;
  updateConfig: (updates: Partial<JourneyConfigState>) => void;
  updateCtaLabels: (updates: Partial<CtaLabels>) => void;
  updateStepTitles: (updates: Partial<StepTitles>) => void;
  updateLegalTexts: (updates: Partial<LegalTexts>) => void;
  updateFieldOptions: (updates: Partial<FieldOptionsConfig>) => void;
  updateErrorMessages: (updates: Partial<ErrorMessages>) => void;
  updateSupport: (updates: Partial<SupportConfig>) => void;
  updateSteps: (steps: StepConfig[]) => void;
  updateStep: (index: number, step: Partial<StepConfig>) => void;
  addStep: (step: StepConfig) => void;
  removeStep: (index: number) => void;
  reorderSteps: (from: number, to: number) => void;
  updateStepFields: (stepIndex: number, fields: FieldConfig[]) => void;
  updateStepFieldLayouts: (updates: Partial<StepFieldLayout>) => void;
  updateModule: (moduleKind: ModuleKind, config: Partial<ModuleConfig>) => void;
  updateUx: (updates: Partial<UxPreferences>) => void;
  setLogoAndExtractTheme: (logoUrl: string) => Promise<{ primary: string; secondary: string; accent: string }>;
  resetToDefaults: () => void;
  persist: () => void;
  loadFromStorage: () => void;
  importConfig: (json: string) => void;
  applyIdfcPreset: () => void;
}

const JourneyConfigContext = createContext<JourneyConfigContextType | undefined>(undefined);

function extractColorsFromImage(url: string): Promise<{ primary: string; secondary: string; accent: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve({ primary: "#004C8F", secondary: "#0066AA", accent: "#f5f5f5" });
          return;
        }
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const colorCounts: Record<string, number> = {};
        const step = 4 * 10;
        for (let i = 0; i < data.length; i += step) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (a < 128) continue;
          const brightness = (r + g + b) / 3;
          if (brightness < 20 || brightness > 235) continue;
          const key = `${r},${g},${b}`;
          colorCounts[key] = (colorCounts[key] || 0) + 1;
        }
        const sorted = Object.entries(colorCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([k]) => k.split(",").map(Number));
        const primary = sorted[0]
          ? `#${sorted[0].map((c) => c.toString(16).padStart(2, "0")).join("")}`
          : "#004C8F";
        const secondary = sorted[1]
          ? `#${sorted[1].map((c) => c.toString(16).padStart(2, "0")).join("")}`
          : "#0066AA";
        resolve({ primary, secondary, accent: "#f5f5f5" });
      } catch {
        resolve({ primary: "#004C8F", secondary: "#0066AA", accent: "#f5f5f5" });
      }
    };
    img.onerror = () =>
      resolve({ primary: "#004C8F", secondary: "#0066AA", accent: "#f5f5f5" });
    img.src = url;
  });
}

export function JourneyConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<JourneyConfigState>(DEFAULT_JOURNEY_CONFIG);

  const updateConfig = useCallback((updates: Partial<JourneyConfigState>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateCtaLabels = useCallback((updates: Partial<CtaLabels>) => {
    setConfig((prev) => ({ ...prev, ctaLabels: { ...prev.ctaLabels, ...updates } }));
  }, []);

  const updateStepTitles = useCallback((updates: Partial<StepTitles>) => {
    setConfig((prev) => {
      const next: StepTitles = { ...prev.stepTitles };
      for (const k of Object.keys(updates)) {
        const v = updates[k];
        if (typeof v === "string") next[k] = v;
      }
      return { ...prev, stepTitles: next };
    });
  }, []);

  const updateLegalTexts = useCallback((updates: Partial<LegalTexts>) => {
    setConfig((prev) => ({ ...prev, legalTexts: { ...prev.legalTexts, ...updates } }));
  }, []);

  const updateFieldOptions = useCallback((updates: Partial<FieldOptionsConfig>) => {
    setConfig((prev) => ({
      ...prev,
      fieldOptions: {
        ...prev.fieldOptions,
        ...updates,
      },
    }));
  }, []);

  const updateErrorMessages = useCallback((updates: Partial<ErrorMessages>) => {
    setConfig((prev) => ({ ...prev, errorMessages: { ...prev.errorMessages, ...updates } }));
  }, []);

  const updateSupport = useCallback((updates: Partial<SupportConfig>) => {
    setConfig((prev) => ({ ...prev, support: { ...prev.support, ...updates } }));
  }, []);

  const deriveJourneyStepOrder = useCallback((steps: StepConfig[]): Record<string, string[]> => {
    const byPrefix: Record<string, { order: number; stepKind: string }[]> = {};
    for (const s of steps) {
      const match = s.id.match(/^(ntb|etb|etb-nk|ntb-conversion|conversational)-/);
      if (match) {
        const prefix = match[1];
        if (!byPrefix[prefix]) byPrefix[prefix] = [];
        byPrefix[prefix].push({ order: s.order, stepKind: s.stepKind });
      }
    }
    const out: Record<string, string[]> = {};
    for (const [prefix, arr] of Object.entries(byPrefix)) {
      out[prefix] = arr.sort((a, b) => a.order - b.order).map((x) => x.stepKind);
    }
    return out;
  }, []);

  const updateSteps = useCallback((steps: StepConfig[]) => {
    setConfig((prev) => ({
      ...prev,
      steps,
      journeyStepOrder: deriveJourneyStepOrder(steps),
    }));
  }, [deriveJourneyStepOrder]);

  const updateStep = useCallback((index: number, step: Partial<StepConfig>) => {
    setConfig((prev) => {
      const next = [...prev.steps];
      if (next[index]) next[index] = { ...next[index], ...step };
      return { ...prev, steps: next, journeyStepOrder: deriveJourneyStepOrder(next) };
    });
  }, [deriveJourneyStepOrder]);

  const addStep = useCallback((step: StepConfig) => {
    setConfig((prev) => {
      const next = [...prev.steps, { ...step, order: prev.steps.length }];
      return { ...prev, steps: next, journeyStepOrder: deriveJourneyStepOrder(next) };
    });
  }, [deriveJourneyStepOrder]);

  const removeStep = useCallback((index: number) => {
    setConfig((prev) => {
      const next = prev.steps.filter((_, i) => i !== index);
      return { ...prev, steps: next, journeyStepOrder: deriveJourneyStepOrder(next) };
    });
  }, [deriveJourneyStepOrder]);

  const reorderSteps = useCallback((from: number, to: number) => {
    setConfig((prev) => {
      const next = [...prev.steps];
      const [removed] = next.splice(from, 1);
      next.splice(to, 0, removed);
      return { ...prev, steps: next, journeyStepOrder: deriveJourneyStepOrder(next) };
    });
  }, [deriveJourneyStepOrder]);

  const updateStepFields = useCallback((stepIndex: number, fields: FieldConfig[]) => {
    setConfig((prev) => {
      const next = [...prev.steps];
      const step = next[stepIndex];
      if (!step) return prev;
      next[stepIndex] = { ...step, fields };
      return {
        ...prev,
        steps: next,
        stepFieldLayouts: {
          ...prev.stepFieldLayouts,
          [step.stepKind]: fields,
        },
      };
    });
  }, []);

  const updateStepFieldLayouts = useCallback((updates: Partial<StepFieldLayout>) => {
    setConfig((prev) => {
      const nextLayouts = { ...prev.stepFieldLayouts, ...updates };
      if (nextLayouts.welcome) {
        nextLayouts.welcome = nextLayouts.welcome.filter((f) => f.id === "name" || f.id === "mobileNumber");
        if (nextLayouts.welcome.length === 0) nextLayouts.welcome = [...WELCOME_LAYOUT_ONLY_NAME_MOBILE];
      }
      return { ...prev, stepFieldLayouts: nextLayouts };
    });
  }, []);

  const updateModule = useCallback((moduleKind: ModuleKind, moduleConfig: Partial<ModuleConfig>) => {
    setConfig((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.moduleKind === moduleKind ? { ...m, ...moduleConfig } : m
      ),
    }));
  }, []);

  const updateUx = useCallback((updates: Partial<UxPreferences>) => {
    setConfig((prev) => ({
      ...prev,
      ux: { ...prev.ux, ...updates },
    }));
  }, []);

  const setLogoAndExtractTheme = useCallback(async (logoUrl: string) => {
    setConfig((prev) => ({ ...prev, logoUrl }));
    const extracted = await extractColorsFromImage(logoUrl);
    setConfig((prev) => ({ ...prev, extractedTheme: extracted }));
    return extracted;
  }, []);

  const resetToDefaults = useCallback(() => {
    setConfig({ ...DEFAULT_JOURNEY_CONFIG });
  }, []);

  const persist = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }
  }, [config]);

  const loadFromStorage = useCallback(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Partial<JourneyConfigState>;
          setConfig(() => {
            const st = (parsed.stepTitles ?? {}) as Record<string, string | undefined>;
            const stepTitles: StepTitles = { ...DEFAULT_STEP_TITLES };
            for (const k of Object.keys(st)) {
              const v = st[k];
              if (typeof v === "string") stepTitles[k] = v;
            }
            const fo = parsed.fieldOptions;
            const mergedLayouts = { ...DEFAULT_JOURNEY_CONFIG.stepFieldLayouts, ...parsed.stepFieldLayouts };
            return {
              ...DEFAULT_JOURNEY_CONFIG,
              ...parsed,
              ctaLabels: { ...DEFAULT_CTA_LABELS, ...parsed.ctaLabels },
              stepTitles,
              legalTexts: { ...DEFAULT_LEGAL_TEXTS, ...parsed.legalTexts },
              fieldOptions: {
                incomeRange: fo?.incomeRange ?? DEFAULT_FIELD_OPTIONS.incomeRange,
                maritalStatus: fo?.maritalStatus ?? DEFAULT_FIELD_OPTIONS.maritalStatus,
                occupation: fo?.occupation ?? DEFAULT_FIELD_OPTIONS.occupation,
                sourceOfIncome: fo?.sourceOfIncome ?? DEFAULT_FIELD_OPTIONS.sourceOfIncome,
              },
              errorMessages: { ...DEFAULT_ERROR_MESSAGES, ...parsed.errorMessages },
              support: { ...DEFAULT_SUPPORT, ...parsed.support },
              stepFieldLayouts: { ...mergedLayouts, welcome: [...WELCOME_LAYOUT_ONLY_NAME_MOBILE] },
            };
          });
        } catch {}
      }
    }
  }, []);

  const applyIdfcPreset = useCallback(() => {
    setConfig((prev) => {
      const preset = IDFC_JOURNEY_PRESET;
      const stepTitles: StepTitles = { ...prev.stepTitles, ...preset.stepTitles };
      return {
        ...prev,
        ...preset,
        ctaLabels: { ...prev.ctaLabels, ...preset.ctaLabels },
        stepTitles,
        legalTexts: { ...prev.legalTexts, ...preset.legalTexts },
        fieldOptions: {
          ...prev.fieldOptions,
          ...preset.fieldOptions,
        },
        errorMessages: { ...prev.errorMessages, ...preset.errorMessages },
        support: { ...prev.support, ...preset.support },
        stepFieldLayouts: { ...prev.stepFieldLayouts, ...preset.stepFieldLayouts },
      };
    });
  }, []);

  const importConfig = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json) as Partial<JourneyConfigState>;
      const st = (parsed.stepTitles ?? {}) as Record<string, string | undefined>;
      const stepTitles: StepTitles = { ...DEFAULT_STEP_TITLES };
      for (const k of Object.keys(st)) {
        const v = st[k];
        if (typeof v === "string") stepTitles[k] = v;
      }
      const fo = parsed.fieldOptions;
      const mergedLayouts = { ...DEFAULT_JOURNEY_CONFIG.stepFieldLayouts, ...parsed.stepFieldLayouts };
      setConfig(() => ({
        ...DEFAULT_JOURNEY_CONFIG,
        ...parsed,
        ctaLabels: { ...DEFAULT_CTA_LABELS, ...parsed.ctaLabels },
        stepTitles,
        legalTexts: { ...DEFAULT_LEGAL_TEXTS, ...parsed.legalTexts },
        fieldOptions: {
          incomeRange: fo?.incomeRange ?? DEFAULT_FIELD_OPTIONS.incomeRange,
          maritalStatus: fo?.maritalStatus ?? DEFAULT_FIELD_OPTIONS.maritalStatus,
          occupation: fo?.occupation ?? DEFAULT_FIELD_OPTIONS.occupation,
          sourceOfIncome: fo?.sourceOfIncome ?? DEFAULT_FIELD_OPTIONS.sourceOfIncome,
        },
        errorMessages: { ...DEFAULT_ERROR_MESSAGES, ...parsed.errorMessages },
        support: { ...DEFAULT_SUPPORT, ...parsed.support },
        stepFieldLayouts: { ...mergedLayouts, welcome: [...WELCOME_LAYOUT_ONLY_NAME_MOBILE] },
      }));
    } catch {
      throw new Error("Invalid config JSON");
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      loadFromStorage();
    }
  }, []);

  const value: JourneyConfigContextType = {
    config,
    updateConfig,
    updateCtaLabels,
    updateStepTitles,
    updateLegalTexts,
    updateFieldOptions,
    updateErrorMessages,
    updateSupport,
    updateSteps,
    updateStep,
    addStep,
    removeStep,
    reorderSteps,
    updateStepFields,
    updateStepFieldLayouts,
    updateModule,
    updateUx,
    setLogoAndExtractTheme,
    resetToDefaults,
    persist,
    loadFromStorage,
    importConfig,
    applyIdfcPreset,
  };

  return (
    <JourneyConfigContext.Provider value={value}>
      {children}
    </JourneyConfigContext.Provider>
  );
}

export function useJourneyConfig() {
  const ctx = useContext(JourneyConfigContext);
  if (!ctx) throw new Error("useJourneyConfig must be used within JourneyConfigProvider");
  return ctx;
}
