# Product Requirements Document: Journeys & Journey Builder

**Product:** HDFC Bank Salary Account Journey Platform  
**Document Type:** PRD (Product Requirements Document)  
**Version:** 1.0  
**Date:** February 2026  
**Status:** Draft  
**Owner:** Product  

---

## Table of Contents

1. [Document Control & Glossary](#1-document-control--glossary)  
2. [Product Vision & Goals](#2-product-vision--goals)  
3. [User Personas & Roles](#3-user-personas--roles)  
4. [Journey Types & Flows](#4-journey-types--flows)  
5. [Journey Specifications (Exhaustive)](#5-journey-specifications-exhaustive)  
6. [Data Model & Configuration Schema](#6-data-model--configuration-schema)  
7. [Journey Builder: Functional Specification](#7-journey-builder-functional-specification)  
8. [Field Configuration: Exhaustive Specification](#8-field-configuration-exhaustive-specification)  
9. [API Integration: Exhaustive Specification](#9-api-integration-exhaustive-specification)  
10. [Validation, Error Handling & Edge Cases](#10-validation-error-handling--edge-cases)  
11. [Non-Functional Requirements](#11-non-functional-requirements)  
12. [Acceptance Criteria & Success Metrics](#12-acceptance-criteria--success-metrics)  
13. [Appendices](#13-appendices)  

---

## 1. Document Control & Glossary

### 1.1 Version History

| Version | Date | Author | Summary |
|--------|------|--------|---------|
| 1.0 | Feb 2026 | — | Initial complete PRD: Journeys + Journey Builder |

### 1.2 Glossary

| Term | Definition |
|------|------------|
| **Journey** | End-to-end flow a user completes (e.g. NTB salary account opening). |
| **Page** | A single screen in the journey; maps to one **Step** in config. |
| **Step** | Configuration entity: `StepConfig`; has `stepKind`, `title`, `fields`, `order`. |
| **Section** | Logical grouping of fields within a page; has `heading`, `subheading`, `fieldIds`. |
| **Field** | Single data capture point: input, document upload, or API-driven. |
| **Step Kind** | Semantic type of step (e.g. `welcome`, `ekycHandler`, `profileDetails`). |
| **Field Kind** | Semantic type of field (e.g. `name`, `mobileNumber`, `pan`). |
| **Component Type** | UI type: `input`, `documentUpload`, `api`. |
| **Data Source** | Origin of data: `bank-api`, `tartan-api`, `manual`. |
| **Prefill Mode** | How value is set: `manual`, `prefill`, `prefillEditable`, `prefillReadOnly`. |
| **Main API** | Primary API used for a field; tried first. |
| **Fallback API** | Backup API used when Main fails or times out. |
| **Additional APIs** | Optional supplementary APIs for enrichment. |
| **CTA** | Call-to-action (e.g. Continue, Submit, Verify OTP). |
| **NTB** | New to Bank — first-time customer. |
| **ETB** | Existing to Bank — existing customer, auto-conversion. |
| **ETB-NK** | Existing to Bank, No KYC — existing customer requiring KYC. |

---

## 2. Product Vision & Goals

### 2.1 Vision

Enable banks and corporates to run configurable, compliant salary-account journeys (NTB, ETB, ETB-NK) with a single Journey Builder that controls every page, section, field, data source, validation, and API integration.

### 2.2 Goals

- **Default journeys:** Ship NTB, ETB, and ETB-NK with regulatory-compliant defaults.  
- **No-code customization:** Configure steps, fields, sections, APIs, validations, and CTAs without code.  
- **API-first:** Support Main / Fallback / Additional API priority and response-to-field mapping.  
- **Flexible fields:** Input (string, number, date, email, phone, PAN, Aadhaar, dropdown), Document Upload, API-driven.  
- **Prefill control:** Manual only, prefill only, prefill + editable, prefill + read-only.  
- **Validation:** Required, length, regex, format, range, file type/size with custom error messages.  
- **Consistency:** Same flow regardless of entry point (RM Portal, HR Portal, direct link).

---

## 3. User Personas & Roles

| Persona | Role | Uses Journeys | Uses Journey Builder |
|---------|------|----------------|----------------------|
| **Employee** | End user | Yes — completes journey | No |
| **HR** | Corporate HR | Views status, invites employees | No (view only) |
| **RM** | Relationship Manager | Invites, views status, manages corporates | No (view only) |
| **Super Admin / Configurator** | Back-office | — | Yes — configures all journeys |

---

## 4. Journey Types & Flows

### 4.1 Journey Types

| Type | Code | Target | Primary Use Case |
|------|------|--------|------------------|
| New to Bank | `ntb` | First-time customers | Full KYC, account opening |
| Existing to Bank | `etb` | Existing customers | Auto-conversion, minimal steps |
| Existing to Bank, No KYC | `etb-nk` | Existing, KYC required | KYC + conversion |

### 4.2 High-Level Flow Diagrams

**NTB:**

```
Welcome (name, mobile)
  → KYC Choice (Aadhaar eKYC | Physical KYC)
  → If Aadhaar: eKYC (PAN, DOB, email, Aadhaar, OTP on same page)
  → Profile Details (income, nominee)
  → Review
  → Account Activated (account details, pre-approved offers)
  → User chooses: "Continue with Video KYC" only (no "I'm done")
  → Video KYC
  → Complete
```

**ETB:**

```
Welcome (name, mobile only)
  → Auto Conversion (pre-filled account, confirm)
  → Complete
```

**ETB-NK:**

```
Welcome (name, mobile only)
  → KYC Choice (Aadhaar eKYC | Physical KYC)
  → eKYC or Physical
  → Profile Details (income, nominee)
  → Review
  → Account Activated
  → Continue with Video KYC
  → Video KYC
  → Complete
```

### 4.3 Entry Points

- RM Portal: invite from employee list (journey type from employee record).  
- HR Portal: invite from employee list.  
- Direct link: journey type from URL or stored config.  
**Requirement:** From whichever entry point, the same journey type (NTB/ETB/ETB-NK) must run the same step sequence and field set.

---

## 5. Journey Specifications (Exhaustive)

### 5.1 NTB (New to Bank) — Full Specification

#### 5.1.1 Step 1: Welcome

| Attribute | Value |
|-----------|--------|
| Step ID | `ntb:welcome` |
| Step Kind | `welcome` |
| Title | Configurable (e.g. "Enter details to start your savings journey now!") |
| Sections | 1 section: **Identity Capture** |

**Fields (containerized):**

| Order | Field Kind | Label (default) | Component Type | Data Source | Required | Validation |
|-------|------------|-----------------|----------------|-------------|----------|------------|
| 1 | name | Full Name | input (string) | manual / bank-api / tartan-api | Yes | required |
| 2 | mobileNumber | Aadhaar linked mobile | input (phone) | manual / bank-api / tartan-api | Yes | required, 10 digits |
| 3 | otp | OTP | input (otp) | tartan-api / bank-api | Yes | required, 6 digits |

**Section:**

- **Heading:** (optional) e.g. "Identity"  
- **Subheading:** (optional) e.g. "Please provide your details to begin."  
- **Field IDs:** `["name", "mobileNumber", "otp"]`  

**CTA:** Single primary CTA; label from config (e.g. "Continue"). No secondary CTA on this step.

**Behaviour:**

- OTP sent to mobile; success criteria: HTTP 200/201 from OTP API.  
- Aadhaar must **not** be pre-filled on Welcome (compliance).  
- Progress: "Save & continue later" and auto-save supported.

---

#### 5.1.2 Step 2: KYC Choice

| Attribute | Value |
|-----------|--------|
| Step ID | `ntb:kycChoice` |
| Step Kind | `kycChoice` |
| Title | Configurable (e.g. "Select KYC") |

**Fields:** None (choice only).

**Options:** Aadhaar eKYC | Physical KYC (branch).

**Branching:**

- Aadhaar eKYC → next step `ntb:ekycHandler`.  
- Physical KYC → next step Physical KYC (branch reference / branch locator); journey may end with "Application Saved" and reference ID.

**CTA:** e.g. "Continue" after selection.

---

#### 5.1.3 Step 3: eKYC Handler (Aadhaar eKYC)

| Attribute | Value |
|-----------|--------|
| Step ID | `ntb:ekycHandler` |
| Step Kind | `ekycHandler` |
| Title | Configurable (e.g. "e-KYC Verification") |
| Sections | 1 section: **eKYC Form** |

**Fields:**

| Order | Field Kind | Label | Component Type | Data Source | Required | Validation |
|-------|------------|-------|----------------|-------------|----------|------------|
| 1 | pan | PAN | input (pan) | manual / bank-api / tartan-api | Yes | required, PAN regex |
| 2 | dob | Date of Birth | input (date) | manual / bank-api / tartan-api | Yes | required, valid date |
| 3 | email | Email | input (email) | manual / bank-api / tartan-api | Yes | required, email format |
| 4 | aadhaarNumber | 12-digit Aadhaar | input (aadhaar) | manual / bank-api / tartan-api | Yes | required, 12 digits, masked |
| 5 | otp | OTP | input (otp) | tartan-api / bank-api | Yes | required, 6 digits |

**Behaviour:**

- All five fields on same page.  
- Aadhaar OTP triggered from this step; UIDAI consent shown as configured.  
- Success: eKYC success response; then advance to Profile Details.

**CTA:** e.g. "Verify Aadhaar" / "Get OTP" then "Verify & Continue".

---

#### 5.1.4 Step 4: Profile Details

| Attribute | Value |
|-----------|--------|
| Step ID | `ntb:profileDetails` |
| Step Kind | `profileDetails` |
| Title | Configurable (e.g. "Your Details" / "Please enter your Professional & Personal details") |
| Sections | 2 sections: **Income**, **Nominee** |

**Section 1 — Income:**

| Order | Field Kind | Label | Component Type | Data Source | Required |
|-------|------------|-------|----------------|-------------|----------|
| 1 | incomeRange | Income Range | dropdown | manual / bank-api / tartan-api | Yes |
| 2 | grossAnnualIncome | Gross annual income (₹) | input (number) | manual / bank-api / tartan-api | Optional |

**Section 2 — Nominee:**

| Order | Field Kind | Label | Component Type | Data Source | Required |
|-------|------------|-------|----------------|-------------|----------|
| 1 | nomineeInfo | Nominee Information | input / structured (name, relation, %) | manual / bank-api / tartan-api | As per config |

**CTA:** e.g. "Continue" / "Save & continue".

---

#### 5.1.5 Step 5: Review Application

| Attribute | Value |
|-----------|--------|
| Step ID | `ntb:reviewApplication` |
| Step Kind | `reviewApplication` |
| Title | Configurable (e.g. "Review Application" / "Final Verification") |

**Fields:** No input fields. Read-only summary of all collected data (name, mobile, PAN, DOB, email, income, nominee, etc.).

**CTA:** e.g. "Confirm & Continue" / "Submit Application".

---

#### 5.1.6 Step 6: Account Activated (Pre-approved Offers)

| Attribute | Value |
|-----------|--------|
| Step ID | `ntb:preApprovedOffers` |
| Step Kind | `preApprovedOffers` |
| Title | Configurable; display "Account activated" badge |

**Content:**

- Account details block: CIF, Account Number, IFSC, Branch (from journey state / API).  
- Pre-approved offers (cross-sell).  
- **Single CTA only:** "Continue with Video KYC". **No** "I'm done" or skip option.

**CTA:** Label from config (e.g. "Continue with Video KYC").

---

#### 5.1.7 Step 7: Video KYC

| Attribute | Value |
|-----------|--------|
| Step ID | `ntb:videoKyc` |
| Step Kind | `videoKyc` |
| Title | Configurable (e.g. "Video KYC") |

**Content:** Consent (VCIP, present in India, etc.), then "Start Video Verification". No input fields beyond consent checkboxes.

**CTA:** "Start Video Verification" → after completion, auto-advance to Complete.

---

#### 5.1.8 Step 8: Complete

| Attribute | Value |
|-----------|--------|
| Step ID | `ntb:complete` |
| Step Kind | `complete` |
| Title | Configurable (e.g. "Submitted") |

**Content:** Success message, reference number (if any). No fields. Journey ends.

---

### 5.2 ETB (Existing to Bank) — Full Specification

#### 5.2.1 Step 1: Welcome

| Attribute | Value |
|-----------|--------|
| Step ID | `etb:welcome` |
| Step Kind | `welcome` |
| Title | Configurable |

**Fields:** **Only** name and mobile number (same as NTB Welcome but no OTP on same page if flow differs; typically name + mobile, then OTP or auto-verify).

**Explicit requirement:** Welcome page must contain **only** name and phone number; all other fields appear from the next page onwards.

---

#### 5.2.2 Step 2: Auto Conversion

| Attribute | Value |
|-----------|--------|
| Step ID | `etb:autoConversion` |
| Step Kind | `autoConversion` |
| Title | Configurable (e.g. "Convert to Salary Account") |

**Fields:** Pre-filled account details (from bank API); user confirms. No manual entry for account number/CIF if provided by API.

**CTA:** e.g. "Confirm" / "Proceed to open account".

---

#### 5.2.3 Step 3: Complete

| Attribute | Value |
|-----------|--------|
| Step ID | `etb:complete` |
| Step Kind | `complete` |

**Content:** Success; journey ends.

---

### 5.3 ETB-NK (Existing to Bank, No KYC) — Full Specification

- **Welcome:** Same as NTB/ETB — name and mobile only.  
- **KYC Choice → eKYC or Physical → Profile Details → Review → Account Activated → Video KYC → Complete.**  
- Field and section definitions align with NTB where steps are shared; step IDs are `etb-nk:*`.

---

### 5.4 Cross-Journey Rules (Must Hold)

1. **Welcome:** For NTB, ETB, ETB-NK the welcome page must only contain **name** and **phone number**; rest from next page onwards.  
2. **Account Activated:** After "Account activated" step, the only CTA is **"Continue with Video KYC"**; no "I'm done" / skip.  
3. **Aadhaar:** Never pre-fill Aadhaar on Welcome.  
4. **Consent:** Company portal consent (if used) and Aadhaar/KYC consents must be configurable in builder and shown where specified.

---

## 6. Data Model & Configuration Schema

### 6.1 Core Entities

#### 6.1.1 JourneyConfigState (Root)

| Property | Type | Description |
|----------|------|-------------|
| journeyId | string | Unique journey config id |
| journeyName | string | Display name |
| bankName | string | Bank name (e.g. HDFC Bank) |
| journeyMode | "form" \| "conversational" | Form-based or conversational |
| offerJourneyModeChoice | boolean | Whether user can switch mode |
| steps | StepConfig[] | Ordered list of steps (pages) |
| modules | ModuleConfig[] | Module provider per capability |
| ux | UxPreferences | Guidance, CTA style, progress, etc. |
| logoUrl | string \| null | Logo URL |
| extractedTheme | object \| null | Primary, secondary, accent from logo |
| ctaLabels | CtaLabels | All CTA button labels |
| stepTitles | StepTitles | Step titles by step kind |
| legalTexts | LegalTexts | Terms, privacy, VKYC consent, etc. |
| fieldOptions | FieldOptionsConfig | Dropdown options (income, marital status, etc.) |
| errorMessages | ErrorMessages | Required, consent, OTP errors |
| support | SupportConfig | Help, FAQ, phone |
| stepFieldLayouts | Partial<StepFieldLayout> | Default field layout per step kind |
| prefillOnConsent | boolean | Prefill from company portal on consent |
| showPreApprovedOffersBeforeVideoKyc | boolean | Show offers before Video KYC |
| journeyStepOrder | Record<string, string[]> | Override step order per journey type |

#### 6.1.2 StepConfig

| Property | Type | Description |
|----------|------|-------------|
| id | string | Unique step id (e.g. ntb:welcome) |
| stepKind | StepKind | welcome, ekycHandler, profileDetails, ... |
| title | string | Page title |
| fields | FieldConfig[] | Fields on this page |
| order | number | Display order |
| sections | SectionConfig[] | Optional grouping of fields |

#### 6.1.3 SectionConfig

| Property | Type | Description |
|----------|------|-------------|
| id | string | Unique section id |
| heading | string | Section heading |
| subheading | string | Optional subheading |
| order | number | Order within page |
| fieldIds | string[] | Field ids (FieldKind) in this section |

#### 6.1.4 FieldConfig

| Property | Type | Description |
|----------|------|-------------|
| id | FieldKind | name, mobileNumber, email, pan, ... |
| label | string | Display label |
| source | DataSource | bank-api \| tartan-api \| manual |
| required | boolean | Required validation |
| order | number | Order within step/section |
| componentType | FieldComponentType | input \| documentUpload \| api |
| inputType | InputFieldType | string \| number \| date \| email \| phone \| pan \| aadhaar \| dropdown |
| prefillMode | PrefillMode | manual \| prefill \| prefillEditable \| prefillReadOnly |
| apiConfig | object | main, fallback, additional ApiConfig |
| validations | ValidationRule[] | required, minLength, maxLength, regex, ... |
| placeholder | string | Placeholder text |
| allowedFileTypes | string[] | PDF, JPG, PNG, ... (for documentUpload) |
| maxFileSizeMb | number | Max file size in MB |
| uploadInstructions | string | Instructions for document upload |

#### 6.1.5 ApiConfig

| Property | Type | Description |
|----------|------|-------------|
| apiId | string | Reference to saved API |
| apiName | string | Display name |
| endpoint | string | Full URL |
| method | GET \| POST \| PUT \| PATCH | HTTP method |
| responsePath | string | JSON path e.g. data.name |

#### 6.1.6 ValidationRule

| Property | Type | Description |
|----------|------|-------------|
| type | string | required \| minLength \| maxLength \| regex \| email \| min \| max \| fileType \| fileSize |
| value | string \| number | Parameter (e.g. 3 for minLength, regex string) |
| message | string | Custom error message |

### 6.2 Step Kinds (Complete List)

| stepKind | Label |
|----------|--------|
| welcome | Welcome / OTP |
| kycChoice | KYC Type Selection |
| ekycHandler | Aadhaar eKYC |
| physicalKyc | Physical KYC |
| profileDetails | Profile Details (YOUR) |
| incomeDetails | Income Details |
| etbIncomeDeclarations | Income & Declarations |
| nomineeDetails | Nominee Details |
| reviewApplication | Review Application |
| videoKyc | Video KYC |
| autoConversion | Account Conversion |
| conversionVerification | Conversion Verification |
| etbKycProfile | ETB KYC Profile |
| complete | Complete |
| preApprovedOffers | Pre-approved Offers (before VKYC) |
| custom | Custom Step |

### 6.3 Field Kinds (Complete List)

| Field Kind | Default Label |
|------------|----------------|
| name | Full Name |
| mobileNumber | Mobile Number |
| email | Email |
| dob | Date of Birth |
| pan | PAN |
| aadhaarNumber | 12-digit Aadhaar number |
| fatherName | Father's Name |
| motherName | Mother's Name |
| maritalStatus | Marital Status |
| incomeRange | Income Range |
| grossAnnualIncome | Gross annual income (₹) |
| occupation | Occupation |
| sourceOfIncome | Source of income |
| permanentAddress | Permanent Address |
| communicationAddress | Communication Address |
| nomineeInfo | Nominee Information |
| declarations | Regulatory Declarations |
| consents | Consents (T&C, Privacy) |
| employmentDetails | Employment Details |
| accountSelection | Account Selection |
| otp | OTP Verification |
| documentUpload | Document Upload |
| profileDetails | Profile Details |

---

## 7. Journey Builder: Functional Specification

### 7.1 Access & Entry

- **Entry:** Modal or dedicated route opened from app header/settings (e.g. "Journey Builder" / "Configure Journey").  
- **Roles:** Only Super Admin / Configurator can edit; HR/RM may have read-only view if required.  
- **Persistence:** Config saved to backend or localStorage; apply to current session and future loads.

### 7.2 Wizard Structure

The Journey Builder is a **4-step wizard**:

| Step | Name | Purpose |
|------|------|---------|
| 1 | Journey & Bank | Journey type (form/conversational), bank name, presets (e.g. HDFC Bank) |
| 2 | Branding | Logo, colours, font, preset (glassy/neobrutalist/minimal), header size, input style |
| 3 | Structure | Pages & steps: add/remove/reorder steps; load default NTB/ETB/ETB-NK |
| 4 | Fine-tune | Field configuration, module providers, UX toggles, CTA labels, step titles, legal text |

### 7.3 Step 1: Journey & Bank — Exhaustive

**7.3.1 Journey Type**

- **Control:** Two large cards: "Form-based", "Conversational".  
- **Form-based:** Traditional step-by-step; each step is a form page.  
- **Conversational:** AI/chat-style; HRMS backfill; quick path.  
- **State:** `journeyConfig.journeyMode`.  
- **Copy:** Short description under each card; helper text below: "Employees will see this journey type when they open their invite link."

**7.3.2 Bank Name**

- **Control:** Single text input.  
- **State:** `journeyConfig.bankName`.  
- **Placeholder:** "e.g. HDFC Bank".  
- **Helper:** "This name appears throughout the journey (headings, messages, consent text)."

**7.3.3 Bank Presets**

- **Control:** Button "Apply HDFC Bank Preset".
- **Action:** Sets theme (HDFC), applies preset: bank name, CTA labels, step titles, legal text, support, colours.
- **Helper:** "One-click optimise all 3 journeys (NTB, ETB, ETB-NK) for HDFC Bank—branding, CTAs, legal text, support info."

### 7.4 Step 2: Branding — Exhaustive

**7.4.1 Logo Upload**

- **Control:** File input (accept image/*); preview thumbnail; "Upload Logo" button.  
- **Optional:** "Apply Theme from Logo" (extract primary/secondary/accent).  
- **State:** `journeyConfig.logoUrl`, `journeyConfig.extractedTheme`, branding `primary`/`secondary`/`accent`.

**7.4.2 Color Palette**

- **Controls:** Three inputs (or color pickers): Primary, Secondary, Accent.  
- **State:** Branding config; may sync to journey theme.

**7.4.3 Font Family**

- **Control:** Dropdown. Options: Plus Jakarta Sans, Open Sans, Inter, Poppins, Roboto.  
- **State:** `brandingConfig.fontFamily`.

**7.4.4 Visual Preset**

- **Control:** Three buttons: Glassy, Neobrutalist, Minimal.  
- **State:** `brandingConfig.preset`. Affects borders, shadows, overall look.

**7.4.5 Glass Opacity**

- **Control:** Slider 0–100%.  
- **State:** `brandingConfig.glassOpacity`.

**7.4.6 Header Size**

- **Control:** Dropdown: Regular, Large.  
- **State:** `brandingConfig.modules.headerSize`.

**7.4.7 Input Style**

- **Control:** Dropdown: Filled, Outline.  
- **State:** `brandingConfig.modules.inputStyle`.

**7.4.8 Module Toggles (e.g. Help Sidebar, Security Badges)**

- **Controls:** Toggle switches.  
- **State:** `brandingConfig.modules.showBenefits`, `showSecurity`, etc.  
- **Helper:** Short description per toggle.

### 7.5 Step 3: Structure — Exhaustive

**7.5.1 Section Title**

- "Pages & Steps" (or "Journey Structure").

**7.5.2 Actions**

- **Load Default NTB:** Replaces `steps` with NTB default step list; resets expanded state.  
- **Load Default ETB:** Same for ETB.  
- **Load Default ETB-NK:** Same for ETB-NK.  
- **Add Step:** Appends new step: `id: step-${Date.now()}`, `stepKind: welcome`, `title: "New Step"`, `fields: getFieldsForStepKind("welcome")`, `order: steps.length`. Expands the new step.

**7.5.3 Step List**

- **Display:** One card per step.  
- **Per step:**  
  - **Drag handle:** For reorder (if drag-and-drop implemented).  
  - **Expand/Collapse:** Chevron; body shows step configuration.  
  - **Title:** Editable input bound to `step.title`.  
  - **Step Kind:** Dropdown of all `StepKind` values; label from `STEP_KINDS`.  
  - **Remove:** Button to delete step; confirm if step has fields.  
- **Reorder:** Up/Down or drag; updates `order` and persists.

**7.5.4 Step Body (when expanded)**

- **Title:** Text input.  
- **Step Kind:** Dropdown.  
- **Fields (summary):** List of field labels or "No fields"; link or inline to Fine-tune (Step 4) for this step’s fields.  
- **Sections (optional):** If sections supported, list sections with heading, subheading, and field IDs; add section, remove section, reorder.

### 7.6 Step 4: Fine-tune — Exhaustive

**7.6.1 Field Configuration**

- **Section title:** "Field Configuration".  
- **Helper:** "Configure each field: type (Input, Document Upload, API), data source, prefill behavior, and validations."  
- **Structure:** For each step, show a block with step title; under it, one **FieldConfigCard** per field.

**7.6.2 FieldConfigCard (per field)**

- **Summary row (always visible):**  
  - Chevron to expand/collapse.  
  - **Label:** Text input (field label).  
  - **Data Source:** Dropdown: Bank API, Tartan API, Manual.  
  - **Badge:** Component type (input / documentUpload / api).  
- **Expanded panel:**  
  - **Component Type:** Three buttons: Input Field, Document Upload, API.  
  - **If Input:**  
    - **Field Type:** Dropdown (String, Number, Date, Email, Phone, PAN, Aadhaar, Dropdown).  
    - **Placeholder:** Text input.  
    - **Data Entry (Prefill Mode):** Dropdown (Manual only, Prefill from API, Prefill + Editable, Prefill + Read-only).  
  - **If Document Upload:**  
    - **Allowed File Types:** Multi-select or pills: PDF, JPG, JPEG, PNG, DOC, DOCX.  
    - **Max File Size (MB):** Number input (e.g. 1–50, default 5).  
    - **Instructions (optional):** Text input.  
  - **If API:**  
    - **Main API (primary):** Text input (API name or endpoint placeholder).  
    - **Fallback API (backup):** Text input, placeholder "Optional - used if main fails".  
    - **Additional APIs:** Text input, placeholder "e.g. API 1, API 2 (comma-separated)".  
    - **Data Entry (Prefill Mode):** Same dropdown as input.  
  - **Validations:**  
    - **Required:** Single checkbox.  
    - (Future: "+ Add Validation" for minLength, maxLength, regex, etc., with type + value + message.)

**7.6.3 Module Provider Selection**

- **Section title:** "Module Provider Selection".  
- **Helper:** "Choose Bank Modules, Tartan Modules, or 3rd Party Vendors for each capability."  
- **Per module kind (Aadhaar eKYC, Video KYC, OTP, PAN, etc.):**  
  - **Provider:** Three buttons: Bank Modules, Tartan Modules, 3rd Party.  
  - **If 3rd Party:** List of vendor chips (e.g. Diginet, Karza, Signzy for Aadhaar eKYC).  
- **State:** `journeyConfig.modules[]` with `moduleKind`, `provider`, `thirdPartyVendor?`.

**7.6.4 UX & Guidance**

- **Guidance Style:** Three options: Herder, Guided, Minimal.  
- **Microcopy Tone:** Formal, Friendly, Conversational.  
- **Toggles:** Exit Intent, Save & Resume, Nudge Reminders, Estimated Time, Back Navigation.  
- **State:** `journeyConfig.ux`.

**7.6.5 CTA Labels**

- **Grid of label inputs.** Keys: continue, submit, verifyOtp, getOtp, verifyAadhaar, proceedToVideoKyc, submitApplication, confirmAndContinue, imDone, back, okay, proceedToOpenAccount.  
- **State:** `journeyConfig.ctaLabels`.

**7.6.6 Step Titles**

- **Inputs per step kind:** welcome, profileDetails, autoConversion, videoKyc, reviewApplication, complete, (and any extended keys).  
- **State:** `journeyConfig.stepTitles`.

**7.6.7 Legal & Consent**

- **Inputs:** Terms Title, Terms Description, Privacy Title, VKYC Present in India, Company Portal Consent (optional), Aadhaar consent, nominee disclaimer, KYC disclaimer, tax resident disclaimer (if used).  
- **State:** `journeyConfig.legalTexts`.

**7.6.8 Journey Flow Toggles**

- **Examples:** "Show pre-approved offers before Video KYC", "Prefill on consent from company portal".  
- **State:** `journeyConfig.showPreApprovedOffersBeforeVideoKyc`, `prefillOnConsent`, etc.

### 7.7 Builder Global Behaviour

- **Unsaved changes:** On close, if `hasUnsavedChanges` then confirm "You have unsaved changes. Close anyway?".  
- **Save:** Explicit "Save" or auto-save on blur; call `persist()`.  
- **Import/Export:** If supported, import JSON config, export JSON config; validate schema before apply.

---

## 8. Field Configuration: Exhaustive Specification

### 8.1 Component Types

| Type | Description | When to Use |
|------|-------------|-------------|
| **input** | Text, number, date, email, phone, PAN, Aadhaar, dropdown | Standard form fields |
| **documentUpload** | File upload with type/size/instructions | ID proof, address proof |
| **api** | Value from API; optional prefill | KYC, account details, enrichment |

### 8.2 Input Field Types (inputType)

| inputType | Label | Format / Validation |
|-----------|--------|---------------------|
| string | String | Free text; optional min/max length, regex |
| number | Number | Numeric; optional min/max, integer/decimal |
| date | Date | DD/MM/YYYY or picker; optional range |
| email | Email | Valid email format |
| phone | Phone | 10 digits, optional country code |
| pan | PAN | [A-Z]{5}[0-9]{4}[A-Z] |
| aadhaar | Aadhaar | 12 digits; masked display |
| dropdown | Dropdown | Options from fieldOptions or API |

### 8.3 Prefill Modes

| Mode | Description | Editable |
|------|-------------|----------|
| manual | User only | Yes |
| prefill | API only; no user edit | No |
| prefillEditable | API first; user can change | Yes |
| prefillReadOnly | API only; display only | No |

### 8.4 Validations (Exhaustive)

| Rule | Applicable | Parameters | Default Message |
|------|------------|------------|-----------------|
| required | All | — | "This field is required." |
| minLength | string | number | "Min length is {value}." |
| maxLength | string | number | "Max length is {value}." |
| regex | string | pattern string | "Invalid format." |
| email | email | — | "Enter a valid email." |
| min | number | number | "Min value is {value}." |
| max | number | number | "Max value is {value}." |
| fileType | documentUpload | extensions | "Allowed: {value}." |
| fileSize | documentUpload | MB number | "Max size is {value} MB." |

Custom message per rule: `ValidationRule.message`.

### 8.5 Document Upload Configuration

- **allowedFileTypes:** Array of: PDF, JPG, JPEG, PNG, DOC, DOCX (configurable).  
- **maxFileSizeMb:** Integer 1–50; default 5.  
- **uploadInstructions:** Optional string, e.g. "Please upload a clear copy of your ID".  
- **Multiple files:** Optional boolean (future); default false (single file).

### 8.6 Dropdown Options

- **Source:** `fieldOptions` in config (incomeRange, maritalStatus, occupation, sourceOfIncome) or API.  
- **Structure:** `{ value: string, label: string }[]`.  
- **Editable in builder:** List of value/label pairs per dropdown field or per option set.

---

## 9. API Integration: Exhaustive Specification

### 9.1 Priority Order

1. **Main API (primary):** Invoked first; response used for prefill and validation.  
2. **Fallback API (backup):** Invoked only if Main fails (4xx/5xx, timeout, network error).  
3. **Additional APIs:** Optional; invoked for enrichment; response merged or displayed as per config.

### 9.2 Per-API Configuration

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| apiId | string | No | Reference to saved API definition |
| apiName | string | No | Display name, e.g. "KYC Verification API" |
| endpoint | string | Yes for call | Full URL, e.g. https://api.example.com/v1/verify |
| method | enum | Yes | GET, POST, PUT, PATCH |
| headers | JSON object | No | Custom headers |
| apiToken | string | No | Bearer token or API key |
| responsePath | string | No | JSON path for value, e.g. data.name |
| successCriteria (HTTP) | number[] | No | [200, 201] default |

### 9.3 Request Building

- **Input mapping:** Which journey fields are sent as query/body (e.g. mobileNumber → request body).  
- **Method + URL + Headers + Body:** Per API definition.  
- **Timeout:** Configurable (e.g. 10s); on timeout, try Fallback if present.

### 9.4 Response Handling

- **Success:** HTTP status in successCriteria; parse JSON; apply `responsePath` to populate field(s).  
- **Failure:** If Main fails, call Fallback; if no Fallback, show error message from config or API body.  
- **Additional APIs:** Call after Main (and optionally Fallback); merge logic: last-wins or defined merge rule.

### 9.5 Adding Fields from API Response

- **Flow:** User selects "API" component type; selects API; optionally provides sample response or schema.  
- **Mapping UI:** List of response paths (e.g. data.name, data.pan); user maps each path to a Field Kind or new field label.  
- **Auto-create fields:** For each mapped path, create a FieldConfig with prefillMode and responsePath.

---

## 10. Validation, Error Handling & Edge Cases

### 10.1 Field Validation

- **On blur / on submit:** Run all ValidationRules; show first failure message next to field.  
- **Required:** Evaluated for empty string, null, undefined; trim string.  
- **API failure:** Show configurable message; optionally "Retry" and "Enter manually" if prefillEditable.

### 10.2 Journey-Level Edge Cases

- **Back from Review:** Allow back; preserve all inputs.  
- **Session expiry:** Save state to localStorage; "Save & continue later"; resume from last step.  
- **Duplicate submit:** Disable CTA after first click; show loading until next step loads.  
- **KYC failure:** Show clear message; allow retry or Physical KYC path if configured.

### 10.3 Builder Edge Cases

- **Delete step that has fields:** Confirm.  
- **Load default journey:** Overwrite current steps; confirm if unsaved.  
- **Invalid JSON on import:** Show error; do not apply.  
- **Missing required config:** Validate before save; block or warn.

---

## 11. Non-Functional Requirements

- **Performance:** Step transition &lt; 500ms; builder open &lt; 1s.  
- **Accessibility:** WCAG 2.1 AA for journey and builder (labels, focus, contrast).  
- **Browser:** Chrome, Safari, Firefox, Edge (last two versions).  
- **Mobile:** Responsive; touch-friendly CTAs and inputs.  
- **Security:** No API keys in client logs; tokens in headers only; HTTPS.

---

## 12. Acceptance Criteria & Success Metrics

### 12.1 Journeys

- [ ] NTB, ETB, ETB-NK run with correct step order and fields as specified.  
- [ ] Welcome page contains only name and phone for all three.  
- [ ] After Account Activated, only "Continue with Video KYC" is shown.  
- [ ] Aadhaar is never pre-filled on Welcome.  
- [ ] Progress and "Save & continue later" work; resume restores state.

### 12.2 Journey Builder

- [ ] All four wizard steps are usable and persist config.  
- [ ] Load Default NTB/ETB/ETB-NK replaces steps correctly.  
- [ ] Add/remove/reorder steps works.  
- [ ] Per-field: component type, data source, input type, placeholder, prefill mode, API (Main/Fallback/Additional), validations (at least Required), document upload options are configurable and saved.  
- [ ] CTA labels, step titles, legal text, module providers are editable and applied in journey.  
- [ ] HDFC Bank preset applies in one click.

### 12.3 Success Metrics

- **Completion rate:** % of started journeys that reach Complete.  
- **Drop-off by step:** Identify steps with highest abandonment.  
- **Builder usage:** Number of config saves; adoption of custom APIs and validations.

---

## 13. Appendices

### Appendix A: Step Kind to Default Fields (Reference)

| stepKind | Default Field Kinds |
|----------|---------------------|
| welcome | name, mobileNumber, otp |
| kycChoice | — |
| ekycHandler | pan, dob, email, aadhaarNumber, otp |
| profileDetails | income, nominee (incomeRange, grossAnnualIncome, nomineeInfo) |
| reviewApplication | (read-only) |
| preApprovedOffers | — |
| videoKyc | — |
| complete | — |
| autoConversion | (pre-filled) |

### Appendix B: CtaLabels Keys (Complete)

continue, submit, verifyOtp, getOtp, verifyAadhaar, proceedToOpenAccount, proceedToVideoKyc, submitApplication, confirmAndContinue, back, okay, imDone.

### Appendix C: API Response Schema Example

```json
{
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "pan": "ABCDE1234F",
    "dob": "1990-05-15",
    "mobileNumber": "9876543210"
  },
  "status": "success"
}
```

Path mapping: `data.name` → name, `data.pan` → pan, etc.

### Appendix D: Module Kinds & Third-Party Vendors

| Module Kind | Vendors (examples) |
|-------------|--------------------|
| aadhaar-kyc | Diginet, Karza, Signzy |
| video-kyc | Au10tix, Veriff, Onfido |
| otp-verification | SMS Country, MSG91, Twilio |
| pan-verification | Karza, Diginet, Signzy |
| document-upload | Signzy, Au10tix, Veriff |
| (others) | See JourneyConfigContext MODULE_KINDS / THIRD_PARTY_VENDORS_BY_MODULE |

---

*End of PRD.*
