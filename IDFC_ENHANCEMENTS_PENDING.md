# HDFC Bank Journey Enhancements – Pending / Needs Details

Items below were **skipped** because they need more specific details, APIs, or integration context before implementation. Context below is derived from the codebase structure and step definitions.

---

## Color Usage (Implemented)

- **Dashboard & Portals**: HDFC Bank theme – blue throughout (`#004C8F`, `#003366`, `#0066AA`). Sidebar, tabs, buttons, links, stat cards, badges, hero banners.
- **Journey & journey pages**: Same HDFC palette via `BrandingContext` and `var(--primary-bank)` / `var(--secondary-bank)`.
- See `tailwind.config.ts` → `dashboard` and `idfc` (HDFC) palettes; `globals.css` for CSS variables.

---

## 1. Corporate Onboarding Flow Structure (KYB Context)

**Current state**: `Dashboard` → Corporates page lists corporates; Connections page shows connection status. No corporate onboarding flow or KYB.

**Target flow** (from RM–HR workflow):
- **Corporate onboarding stage** (before employee invitation):
  1. RM enters PAN + company name → system finds company info
  2. **KYB (Know Your Business)** verification → e.g. Hyperverify integration
  3. **BRE (Business Rules Engine)** mapping → categorizes corporate
  4. Corporate categorization (CAT A, B, C) → criteria:
     - Company turnover ranges
     - GST compliance status rules
     - Number of employees thresholds
     - Year of establishment rules
  5. Bank offers surfaced based on category
  6. HR invited from RM platform; T&C acceptance; RM notified when connection established

**Files to extend**: `DashboardPageContent.tsx` (Corporates, Connections), new `CorporateOnboarding` flow, API routes for KYB/BRE.

---

## 2. RM–HR Integration Workflow

- RM sits with corporate client
- RM takes PAN and company name → finds company info
- Runs KYB → mapped against BRE
- Corporate categorization → shows bank offers
- Visibility for both RM and HR
- HR invitation from RM platform
- T&C acceptance from HR
- RM notification when connection is established
- Employee data visibility (e.g. 5 employees from GreyT)

---

## 3. Account Opening Before Video KYC (Step Order)

**Current step order** (from `stepDefinitions.ts`):

| Journey     | Step sequence |
|------------|----------------|
| NTB        | welcome → kycChoice → profileDetails → nomineeDetails → incomeDetails → reviewApplication → **videoKyc** → complete |
| NTB Conversion | welcome → profileDetails → kycChoice → ekycHandler → physicalKyc → reviewApplication → complete |
| ETB-NK     | welcome → kycChoice → physicalKyc → etbIncomeDeclarations → conversionVerification → etbKycProfile → complete |
| ETB        | welcome → autoConversion → complete |

**HDFC-specific ask**: Account opening (or equivalent step) before Video KYC. Would require reordering NTB steps or adding an intermediate “account opened” confirmation step before `videoKyc`. Exact sequence TBD.

---

## 4. Technical Integrations

- **Push mechanism** for real-time updates
- **CSAOS** integration
- **KYB** integration with Hyperverify
- **Journey builder** configuration for customizable steps

---

## 5. Cross-Selling & Post-Journey

- **Ashwamedha** metal credit card for super affluent segment
- Cross-selling opportunities after account opening
- **Nomination details** integration with primary HRMS criteria (see `StepNomineeDetails`, `StepNomineeInfo`)

---

## Implemented

- HDFC Bank color palette (blue #004C8F, #003366, #0066AA) for journey and dashboard
- Hero banners on RM dashboard and HR Overview (ProductMarketplaceDashboard) with HDFC blue gradient
- BrandingContext set to HDFC colors (journey)
- Step definitions, journey flows (NTB, NTB-conversion, ETB, ETB-NK, conversational)
