# Product Manager Review: Salary Account Journey Prototype

**Review Date:** February 12, 2026  
**Scope:** Full prototype across NTB, ETB, ETB-NK, NTB-Conversion, and Conversational journeys  
**Focus:** Missing gaps, inconsistencies, and resolution recommendations

---

## Executive Summary

The prototype delivers a solid foundation for a bank salary account opening flow with multiple journeys, whitelabel configuration, and invite-based prefilling. Several gaps exist across user flow, data integrity, production readiness, and edge-case handling. This document catalogs every identified gap with severity and recommended resolution.

---

## 1. User Journey & Flow Gaps

### 1.1 No Dedicated "Resume Your Journey" Screen

| Severity | Medium |
|----------|--------|
| **Gap** | `TESTING_INSTRUCTIONS.md` references a "Resume Your Journey" screen where users enter mobile and OTP to continue. No such dedicated component exists. The app resumes from localStorage when `?resume=true` is present but immediately shows the Welcome step; users do not see a distinct "Resume" confirmation screen. |
| **Resolution** | Add a `StepResume` component that: (a) appears when `?resume=true` and localStorage has saved state, (b) shows copy like "Welcome back! Verify your mobile to resume where you left off," (c) collects mobile + OTP, (d) on success redirects to the saved step. Alternatively, keep current behavior but add a banner on the Welcome step: "You have a saved journey. Verify OTP to continue from Step X." |

### 1.2 Journey Entry Points Unclear

| Severity | Medium |
|----------|--------|
| **Gap** | Two entry paths: (1) Dashboard → Invite → `/journey/[inviteId]` with prefilled data, (2) Home page showing Dashboard by default. There is no visible way to start a journey directly from home without an invite (e.g., "Start as NTB" / "Start as ETB" buttons). DemoToggle cycles journey type but is a dev tool, not user-facing. |
| **Resolution** | Add a clear entry: (a) "Start Journey" CTA on Dashboard that opens journey selection or default NTB, or (b) a landing page before Dashboard with "Employee (invite)" vs "Direct (demo)" paths. Document intended production entry (invite-only vs. both). |

### 1.3 Dashboard → Journey Transition

| Severity | Low |
|----------|-----|
| **Gap** | Clicking "Invite" opens the journey in a new tab; the original Dashboard tab stays open. No feedback in Dashboard that the employee has "started" beyond in-memory `invitedEmployeeIds` (reset on refresh). |
| **Resolution** | Persist "Invited" state (e.g., via API or localStorage keyed by `employeeId`). Optionally show "View journey" link that opens the invite URL. Add toast/confirmation: "Invite link copied. Journey opened in new tab." |

### 1.4 Invite Page: No Way to Return to Dashboard

| Severity | Low |
|----------|-----|
| **Gap** | On `/journey/[inviteId]`, the header shows bank logo but no "Exit" or "Back to Dashboard" (for HR testing). Users can only use browser back. |
| **Resolution** | Add a small "Exit" or "Back" link in header when `inviteId` is present, navigating to `/` or a configurable exit URL. Consider `journeyConfig.support.exitUrl` for production. |

### 1.5 ETB Welcome Reuses NTB StepWelcome

| Severity | Low |
|----------|-----|
| **Gap** | `StepEtbWelcome` is a thin wrapper around `StepWelcome`. ETB users may not need Aadhaar/OTP on the first screen if the bank already has their account. Copy and field order are identical. |
| **Resolution** | Either: (a) Use `stepFieldLayouts.welcome` with ETB-specific layout (e.g., skip Aadhaar, only PAN/mobile), or (b) Create `StepEtbWelcome` with ETB-specific copy ("Verify your existing account to convert to Salary") and minimal fields. Ensure journey config supports per-journey welcome layouts. |

---

## 2. Data & Integration Gaps

### 2.1 Analytics Ingest API Missing

| Severity | High |
|----------|------|
| **Gap** | `trackEvent()` in `analytics.ts` posts to `NEXT_PUBLIC_ANALYTICS_API_ENDPOINT || '/api/ingest'`. No `/api/ingest` route exists. All analytics events (page_viewed, journey_completed, kyc_method_selected, etc.) will 404. |
| **Resolution** | Create `src/app/api/ingest/route.ts` that: (a) accepts POST JSON, (b) logs to console in dev, (c) forwards to external analytics (Segment, Mixpanel, etc.) in production, or (d) stores in a simple backend/DB. Return 200 to avoid beacon retries. |

### 2.2 Hardcoded Form Data in JourneyContext

| Severity | High |
|----------|------|
| **Gap** | Default `formData` includes real-looking PII: `mobileNumber: "9934090013"`, `email: "sachin.bansal72@gmail.com"`, etc. This leaks into production builds and is confusing for demos vs. real users. |
| **Resolution** | Use empty strings for production defaults. For demo, either: (a) load from `?demo=true` and inject demo data, (b) use a separate `DEMO_FORM_DATA` env, or (c) let Whitelabel/Config modal provide "Load demo data" button. Never ship hardcoded PII. |

### 2.3 StepComplete: Hardcoded Account Details

| Severity | Medium |
|----------|--------|
| **Gap** | StepComplete shows "Customer ID (CIF): 192837465", "Account Number: XXXX XXXX 1234", "Branch Name: Mumbai Main". These are static placeholders. |
| **Resolution** | Source from `formData` (e.g., `formData.accountNumber`, `formData.cif`, `formData.branchName`) populated by a mock "account opening" API or backend. Add loading/skeleton until data is available. For demo, keep placeholders but make them configurable via journey config. |

### 2.4 OTP Validation Is Mocked

| Severity | High |
|----------|------|
| **Gap** | OTP flow in StepWelcome does not validate against any backend. Any 6-digit input passes. `requestOtp` uses `setTimeout` to simulate success. |
| **Resolution** | Integrate real OTP provider (SMS Country, MSG91, Twilio) for production. For prototype: (a) use a fixed test OTP (e.g., "123456") that succeeds, or (b) add `/api/otp/verify` that accepts a mock secret for dev. Document clearly in UI: "Demo mode: any 6 digits" when in demo. |

### 2.5 Invite PATCH Is No-Op for Stateless Tokens

| Severity | Low |
|----------|-----|
| **Gap** | For token-based invites (`inv_xxx`), PATCH to update status returns `{ ok: true }` but does not persist. Invite status ("started", "completed") cannot be tracked for stateless tokens. |
| **Resolution** | Document that stateless tokens are for Vercel/serverless where no DB exists. For production with a backend, use UUID invites stored in DB and implement real PATCH. Consider hybrid: token embeds data, but a separate analytics endpoint records "started"/"completed" by token id. |

### 2.6 ETB AutoConversion: Accounts Not From Bank

| Severity | Medium |
|----------|--------|
| **Gap** | `StepAutoConversion` uses `formData.accounts` or falls back to synthetic accounts. No API call to fetch real accounts from the bank. |
| **Resolution** | Add `fetchAccounts` (or similar) that calls bank/core API when `formData.accounts` is empty. For prototype, document that prefilledData can include `accounts` from invite and that synthetic list is for demo only. |

---

## 3. UX / UI Gaps

### 3.1 Prefilled Fields: Edit Mode Inconsistency

| Severity | Low |
|----------|-----|
| **Gap** | Conversational flow shows editable prefilled data with "Edit" (pencil) icon. Form flow (StepWelcome) marks prefilled mobile/dob/email as `isPrefilled` and disables inputs. Users cannot correct HR-sourced typos on Welcome without a separate "Edit" affordance. |
| **Resolution** | Add "Edit" next to prefilled fields on Welcome so users can override. Or use `isPrefilled` only for display styling (e.g., badge "From HR") but keep fields editable. Align with Conversational UX. |

### 3.2 OTP "Change Number" Disabled

| Severity | Low |
|----------|-----|
| **Gap** | In StepWelcome, the "Change number" link after OTP is sent is commented out. Users cannot correct a wrong mobile once OTP is requested. |
| **Resolution** | Uncomment and implement: set `otpSent` to false, clear OTP input, allow user to edit mobile and request a new OTP. Add rate limiting (e.g., "Resend in 60s") to prevent abuse. |

### 3.3 Cross-Sell Buttons Non-Functional

| Severity | Low |
|----------|-----|
| **Gap** | StepComplete "Exclusive for You" cards (Millennia Credit Card, Personal Loan, etc.) and "Setup Mobile Banking" / "View Passbook" buttons have no `onClick` or navigation. |
| **Resolution** | Add `onClick` to either: (a) track event + external link (e.g., bank app download), (b) open modal with "Coming soon," or (c) navigate to `/offers/[id]` if offers flow exists. At minimum, `trackEvent('cross_sell_click', { offer })`. |

### 3.4 Save & Continue Later: No Explicit Save Action

| Severity | Low |
|----------|-----|
| **Gap** | Banner says "Your progress is saved automatically" but there is no visible "Save & continue later" button. Users may not understand they can leave mid-form. |
| **Resolution** | Add a secondary CTA "Save & continue later" that: (a) persists formData (already done via updateFormData on blur/submit), (b) shows toast "Progress saved. Use the same link to resume," (c) optionally redirects away or shows a "Resume link" copy. Consider SMS/email with resume link for production. |

### 3.5 Mobile Mock Drawer Hidden on Mobile

| Severity | Low |
|----------|-----|
| **Gap** | `MobileMockDrawer` uses `hidden md:block`—hidden on small screens. Nudge testing and phone preview are desktop-only. |
| **Resolution** | Either: (a) show a simplified notification list on mobile without the phone mockup, or (b) make the drawer a bottom sheet on mobile. Document that the phone mock is a "desktop demo aid" and that real nudges would go to an actual device. |

### 3.6 Video KYC: No Recovery When Camera Denied

| Severity | Medium |
|----------|--------|
| **Gap** | If camera access is denied, `cameraError` is set but there is no "Retry" or "Use different method" (e.g., physical branch). User is stuck. |
| **Resolution** | Add "Try again" button to re-request camera. Add "Can't use camera? Visit a branch or use physical KYC" link that either switches to physical KYC flow or shows branch locator. Make this configurable via journey config (e.g., `showPhysicalKycFallback`). |

### 3.7 Step Progress: Incomplete Step Names on Stepper

| Severity | Low |
|----------|-----|
| **Gap** | `JourneyProgressBar` shows step chips; titles come from `ALL_STEPS` / step definitions. Some steps (e.g., `etbKycProfile`) map to "YOUR" which is vague. |
| **Resolution** | Ensure each step has a user-friendly title in config (e.g., "Your details"). Use `journeyConfig.stepTitles` or step-specific overrides consistently in progress bar. |

---

## 4. Validation & Error Handling

### 4.1 No Centralized Validation Schema

| Severity | Medium |
|----------|--------|
| **Gap** | Validation is scattered: StepWelcome has `validateForm`, StepCombinedDetails has `isFormValid`, etc. No shared schema (e.g., Zod) for formData. Risk of inconsistent rules (e.g., PAN format, Aadhaar length) across steps. |
| **Resolution** | Define `formDataSchema` (Zod) with all fields. Use `react-hook-form` + `@hookform/resolvers/zod` for steps, or a shared `validateFormData(schema, data)` used before submit. Reduces duplication and ensures one source of truth. |

### 4.2 Inline Validation Timing

| Severity | Low |
|----------|-----|
| **Gap** | Some steps show errors only on submit (`showErrors`), others on blur. Inconsistent UX. |
| **Resolution** | Standardize: validate on blur for required fields, and on submit for full form. Use `showErrors` only after first submit attempt. Consider `touched` state per field. |

### 4.3 No Error Boundary for Steps

| Severity | Medium |
|----------|--------|
| **Gap** | If a step component throws, the whole app can crash. No error boundary around step content. |
| **Resolution** | Wrap `JourneyStepWrapper` or step render in an Error Boundary. On error, show StepError with "Something went wrong" and "Retry" / "Back to start." Log error to analytics. |

### 4.4 Pincode Lookup: Limited Coverage

| Severity | Low |
|----------|-----|
| **Gap** | `PINCODE_LOOKUP` in StepCombinedDetails has ~10 hardcoded pincodes (560102, 122003, etc.). Other pincodes show no city/state auto-fill. |
| **Resolution** | Integrate a pincode API (e.g., India Post, or a third-party) for full coverage. For prototype, expand the lookup or add a fallback: "Enter city and state manually." Document limitation. |

---

## 5. Configuration & Whitelabel Gaps

### 5.1 Dual Theming Systems

| Severity | Medium |
|----------|--------|
| **Gap** | `BrandingContext` (primary, secondary, accent, logo) and `JourneyConfigContext` (extractedTheme, logoUrl) both control colors. AgentLayout reads `config.primary` from Branding; some steps use `var(--primary-bank)` which comes from Branding. JourneyConfig's `extractedTheme` is used in Whitelabel modal but not always applied to Branding. |
| **Resolution** | Consolidate: either (a) Branding is the source of truth and JourneyConfig pushes theme into it, or (b) JourneyConfig owns theme and Branding is deprecated for journey screens. Document the flow: Logo upload → extract colors → update Branding + JourneyConfig. |

### 5.2 StepFieldLayouts Not Applied to All Steps

| Severity | Low |
|----------|-----|
| **Gap** | `stepFieldLayouts` are defined for welcome, profileDetails, ekycHandler, etc. StepCombinedDetails uses layout when available, but some steps (e.g., StepEtbNkIncomeDeclarations) may not fully use it. |
| **Resolution** | Audit all steps that have configurable fields. Ensure each uses `getFieldsForStepKind` or equivalent from config. Add layouts for any missing step kinds. |

### 5.3 Whitelabel Modal: Config Not Persisted on Tab Close

| Severity | Low |
|----------|-----|
| **Gap** | User must click "Save Config" to persist. If they close the modal without saving, changes are lost. |
| **Resolution** | Add "Unsaved changes" warning on modal close. Consider auto-save on blur or debounced persist. |

---

## 6. Accessibility Gaps

### 6.1 Focus Management

| Severity | Medium |
|----------|--------|
| **Gap** | No explicit focus management when navigating between steps. Screen-reader users may lose context. OTP input uses `autoFocus` but other critical fields may not. |
| **Resolution** | On step transition, move focus to the first focusable element (or a "Step X" heading with `tabIndex="-1"`). Use `useEffect` + `ref.current?.focus()` after animation. Ensure focus trap in modals (Whitelabel). |

### 6.2 Form Labels & ARIA

| Severity | Low |
|----------|-----|
| **Gap** | Most inputs have visible labels; some may lack `htmlFor`/`id` association. Checkbox/consent labels use `label` wrappers—verify `aria-describedby` for long consent text. |
| **Resolution** | Audit all form fields: ensure `id` on input matches `htmlFor` on label. Add `aria-invalid` and `aria-describedby` for errors. Test with VoiceOver/NVDA. |

### 6.3 Color Contrast

| Severity | Low |
|----------|-----|
| **Gap** | Custom primary/secondary from logo extraction may fail WCAG contrast on white. |
| **Resolution** | After color extraction, validate contrast (e.g., `https://webaim.org/resources/contrastchecker/`). If fail, adjust shade or use overlay. Add `prefers-reduced-motion` support for animations. |

---

## 7. Security & Compliance Gaps

### 7.1 PII in localStorage

| Severity | High |
|----------|------|
| **Gap** | `formData`, `prefilledData`, `baselineData` are stored in localStorage unencrypted. Sensitive: mobile, DOB, PAN, Aadhaar, address, nominee details. Shared device risk. |
| **Resolution** | For production: (a) encrypt formData before localStorage (e.g., AES + user-derived key), or (b) store server-side in secure session and fetch per step. For prototype, add clear disclaimer: "Demo only. Do not use real PII." Reduce retention (clear after 24h or on completion). |

### 7.2 Invite Token Tampering

| Severity | Medium |
|----------|--------|
| **Gap** | Invite token is base64url-encoded JSON. Anyone with the token can decode and alter `prefilledData`. No signature. |
| **Resolution** | Add HMAC signature to token payload. Verify on decode. For production, use JWT or similar signed token. |

### 7.3 Audit Logging

| Severity | Medium |
|----------|--------|
| **Gap** | No audit trail of who accessed what data, when. Important for banking compliance. |
| **Resolution** | Log (server-side) key events: invite_opened, otp_requested, step_completed, journey_completed. Include timestamp, inviteId, anonymized user id. Store in DB or forward to audit service. |

---

## 8. Journey-Specific Gaps

### 8.1 NTB: Nominee Moved to Collapsible but Flow Simplified

| Severity | Low |
|----------|-----|
| **Gap** | NTB flow no longer has a separate nomineeDetails step; nominee is inside StepCombinedDetails (profileDetails). Flow is shorter. Ensure nominee data is still validated and surfaced in Review. |
| **Resolution** | Confirm StepReviewApplication includes nominee section when `wantsNominee` is true. Verify `buildPersonalDetailsBaseline` and form submission include nominee payload. |

### 8.2 NTB-Conversion: No OTP or eKYC on Welcome

| Severity | Low |
|----------|-----|
| **Gap** | NTB-Conversion reuses StepNtbConversionWelcome. Flow skips eKYC per design. Ensure Welcome step for conversion does not show Aadhaar/OTP if not needed, or clearly differentiates from NTB. |
| **Resolution** | If conversion users are pre-verified, use a simplified welcome (e.g., name + DOB only). Otherwise align with product spec. Document why conversion skips eKYC. |

### 8.3 ETB-NK: physicalKyc Removed From Steps

| Severity | Low |
|----------|-----|
| **Gap** | ETB-NK steps (from `getInitialStepsForJourney`) do not include physicalKyc. `StepEtbNkPhysicalKyc` exists but may be reachable only via `switchToPhysicalKycFlow`. Verify ETB-NK KYC choice correctly branches. |
| **Resolution** | Trace ETB-NK flow: kycChoice → physicalKyc branch. Ensure `StepEtbNkKycChoice` and `switchToPhysicalKycFlow` correctly inject physical KYC step. |

### 8.4 Conversational: Hardcoded Fallback Data

| Severity | Medium |
|----------|--------|
| **Gap** | `StepConversationalWelcome` uses `formData.name || "Chirag Sharma"` and similar fallbacks. If formData is empty (e.g., direct entry without invite), users see wrong default. |
| **Resolution** | Use empty strings or "—" for missing data. If no prefilled data, show "We couldn't fetch your details. Please enter manually" and render a compact form. Never show another person's name as default. |

---

## 9. Minor & Polish Gaps

### 9.1 StepComplete "Communicating with Core Systems" Duration

| Severity | Low |
|----------|-----|
| **Gap** | Loading state lasts 2500ms. No real API call. Feels arbitrary. |
| **Resolution** | Either shorten to 1s for snappier feel, or hook to a real "finalize account" API and show real loading. For demo, consider configurable `completeLoadingMs`. |

### 9.2 DemoToggle Placement

| Severity | Low |
|----------|-----|
| **Gap** | DemoToggle is fixed bottom-left. Overlaps with MobileMockDrawer trigger on small screens. |
| **Resolution** | Move to top-right or integrate into header/config. Or hide in production build. |

### 9.3 Duplicate StepFieldRenderer Files

| Severity | Low |
|----------|-----|
| **Gap** | `StepFieldRenderer.tsx` exports `WelcomeFieldRenderer`. There may be two similar files (step field rendering). |
| **Resolution** | Consolidate into one module. `WelcomeFieldRenderer` and any profile field renderer should live in shared component. Eliminate duplication. |

### 9.4 Metadata and SEO

| Severity | Low |
|----------|-----|
| **Gap** | Root layout has `title: "HDFC Bank - Savings Account"`. Invite pages use same metadata. No dynamic title per step or journey. |
| **Resolution** | Use Next.js metadata API per route. E.g., `/journey/[inviteId]` → "Complete your account - {bankName}". Improves tab labeling and SEO. |

---

## 10. Summary: Priority Matrix

| Priority | Count | Focus Areas |
|----------|-------|-------------|
| **P0 (Must Fix)** | 4 | Analytics ingest API, OTP validation, hardcoded PII, PII in localStorage |
| **P1 (Should Fix)** | 8 | Resume screen, StepComplete account data, ETB accounts, error boundary, validation schema, Conversational fallbacks, camera recovery, dual theming |
| **P2 (Nice to Have)** | 15+ | Edit prefilled, change number, cross-sell actions, Save CTA, mobile drawer, pincode API, token signing, audit logging, accessibility, metadata |

---

## Appendix: File Reference

| Area | Key Files |
|------|-----------|
| Journeys | `JourneyContext.tsx`, `stepDefinitions.ts` |
| Steps | `StepWelcome.tsx`, `StepCombinedDetails.tsx`, `StepComplete.tsx`, `StepVideoKycEnhanced.tsx` |
| Config | `JourneyConfigContext.tsx`, `BrandingContext.tsx` |
| Invite | `journey/[inviteId]/page.tsx`, `inviteToken.ts`, `api/invites/` |
| Analytics | `analytics.ts` (no `/api/ingest`) |
| Whitelabel | `WhitelabelModal.tsx` |
