# Product Manager Review 2.0: Post-Implementation Discoveries

**Review Date:** February 12, 2026  
**Scope:** Re-assessment after implementing review.md recommendations (Sections 2–10; Section 1.1 only from Section 1)  
**Purpose:** Document what was fixed, what remains, and new discoveries

---

## Summary of Implemented Fixes

### Section 1.1 ✅ Implemented
- **StepResume** component: Dedicated "Resume Your Journey" screen when `?resume=true` and saved state exists
- Mobile + OTP verification, "Change number" link, demo OTP hint (123456)
- `resumeTargetStepIndex` added to JourneyContext; home page shows StepResume instead of Welcome when resuming

### Section 2 ✅ Implemented
- **`/api/ingest`** route: Accepts POST, logs in dev, can forward to external analytics
- **Hardcoded PII removed**: Empty `formData` defaults; `?demo=true` injects demo data via `DEMO_FORM_DATA`
- **StepComplete**: Account details sourced from `formData.cif`, `formData.accountNumber`, `formData.branchName`
- **OTP validation**: Fixed demo OTP `123456`; any 6 digits in dev. StepWelcome and StepResume use it
- **Invite PATCH** and **StepAutoConversion**: Inline comments documenting stateless token behavior and prefilled `accounts`

### Section 3 ✅ Implemented
- **Prefilled fields**: Now editable (`isPrefilled={false}` so users can correct typos)
- **Change number**: Uncommented; resets OTP section so user can edit mobile
- **Cross-sell**: `trackEvent('cross_sell_click', { offer })` on cards and buttons
- **Save & continue later**: Explicit CTA on StepWelcome; persists and shows notification
- **MobileMockDrawer**: Responsive; bottom sheet on mobile, sidebar on desktop
- **Video KYC**: "Try again" and "Call/visit branch" fallback when camera denied
- **Step titles**: `profileDetails` → "Your Details"; `etbKycProfile` added to BASE_STEP_TITLES

### Section 4 ✅ Implemented
- **formDataSchema** (Zod) in `src/lib/validation.ts` for shared validation
- **StepErrorBoundary**: Wraps JourneyStepWrapper; shows StepError on step crash; logs to analytics
- **Pincode helper**: "Not in our database? Enter city and state manually." when 6-digit pincode not in lookup

### Section 5 ✅ Implemented
- **Whitelabel unsaved warning**: `hasUnsavedChanges` state; `window.confirm` on close if dirty; `markUnsaved()` on logo/theme actions
- Logo upload and `applyExtractedTheme` both update Branding (theme consolidation via modal)

### Section 6 ✅ Implemented
- **Focus management**: JourneyStepWrapper focuses first focusable element on step change
- **ARIA**: StepResume uses `aria-invalid`, `aria-describedby`, `role="alert"` for errors

### Section 7 ✅ Implemented
- **PII disclaimer**: Fixed banner on Dashboard: "Demo only. Do not use real PII. Progress is saved in browser storage."
- **Token signing**: `createInviteToken` / `parseInviteToken` support HMAC when `INVITE_TOKEN_SECRET` is set (server-only verification)
- **Audit events**: `journey_completed`, `step_completed`, `invite_opened`, `otp_requested` tagged with `_audit: true` for ingest

### Section 8 ✅ Implemented
- **Conversational fallbacks**: Empty strings when no prefilled data; alternate copy when `hasPrefilledData` is false

### Section 9 ✅ Implemented
- **StepComplete loading**: `completeLoadingMs = 1500` (configurable constant)
- **DemoToggle**: Moved to top-right (`right-20`) to avoid overlap
- **Journey metadata**: `journey/[inviteId]/layout.tsx` with `generateMetadata` for dynamic title

---

## Remaining Gaps (Not Addressed Per User Request)

- **Section 1.2–1.5**: Journey entry points, Dashboard→Journey transition, invite exit link, ETB welcome differentiation — intentionally skipped
- **formDataSchema**: Created but not yet wired into step components (StepWelcome, StepCombinedDetails still use local validation)
- **Inline validation timing**: No global "validate on blur vs submit" standardization
- **Color contrast**: No post-extraction contrast check for logo theme
- **prefers-reduced-motion**: Animations not yet gated
- **MobileMockDrawer** `markUnsaved`: Only logo/theme trigger it; other config edits (steps, labels, etc.) do not
- **StepReviewApplication nominee**: Assumed correct; not re-audited
- **ETB-NK physicalKyc branching**: Assumed correct; not re-traced

---

## New Discoveries

### 1. **Demo Mode Entry**
- **Discovery**: With empty `formData` by default, users visiting `/` without `?demo=true` or an invite see blank forms. Dashboard shows disclaimer but no explicit "Load demo data" button.
- **Impact**: Demo flow requires `?demo=true` or starting from Dashboard invite. Direct navigation to `/` and "Start journey" is unclear.
- **Recommendation**: Add "Load demo data" button on Dashboard or first step when form is empty; or document `?demo=true` in the disclaimer.

### 2. **StepResume OTP in Production**
- **Discovery**: StepResume accepts only OTP `123456` in production (`process.env.NODE_ENV === "production"`). Any 6 digits work in development.
- **Impact**: Production resume links would require the user to know/use `123456`, which is a security concern if widely known.
- **Recommendation**: Integrate real OTP for production; keep `123456` only for staging/demo environments.

### 3. **Invite Token Verification**
- **Discovery**: `parseInviteToken` verifies HMAC only when `typeof window === "undefined"` (server). The journey page runs `parseInviteToken` on the client. Client-side parsing never verifies the signature.
- **Impact**: Token tampering is possible on the client; verification happens only in API routes (e.g. `GET /api/invites/[inviteId]`). For stateless tokens used directly in the URL, client parses without verification.
- **Recommendation**: For production, consider server-side invite resolution: client sends token to API, server verifies and returns payload. Client never parses raw token.

### 4. **DEMO_FORM_DATA in JourneyContext**
- **Discovery**: `DEMO_FORM_DATA` includes `cif`, `accountNumber`, `branchName` for StepComplete. When user completes without `?demo=true`, StepComplete falls back to hardcoded "192837465", "XXXX XXXX 1234", "Mumbai Main".
- **Impact**: Non-demo users see placeholder account details. Acceptable for prototype.
- **Recommendation**: In production, populate from account-opening API; for demo, ensure `?demo=true` or invite prefilled path sets these.

### 5. **Error Boundary Retry**
- **Discovery**: StepErrorBoundary's "Retry" clears error state and re-renders children. If the error was from invalid props/state, retry may fail again.
- **Impact**: Retry is best-effort; may not recover from all errors.
- **Recommendation**: Consider "Back to start" or "Reload page" as fallback actions.

### 6. **Mobile Drawer on Journey Pages**
- **Discovery**: MobileMockDrawer is rendered via layout or a parent. If it’s only on Dashboard/home, journey pages (`/journey/[inviteId]`) may not show it.
- **Impact**: Nudge testing on mobile might be limited to Dashboard view.
- **Recommendation**: Verify MobileMockDrawer placement; ensure it appears where needed for testing.

### 7. **Conversational Flow Without Prefilled Data**
- **Discovery**: When `hasPrefilledData` is false, messages say "We couldn't fetch your details automatically. Please enter your details below." The form is shown in edit mode. User must fill all fields.
- **Impact**: Flow works; no hardcoded "Chirag Sharma". Minor: "there" may appear if `firstName` is empty (e.g. "Hi there!").
- **Recommendation**: Consider "Hi!" instead of "Hi there!" when name is empty.

### 8. **Validation Schema Unused**
- **Discovery**: `formDataSchema` and `validateFormData` in `src/lib/validation.ts` exist but are not imported by any step component.
- **Impact**: Duplicate validation logic remains in steps; schema is ready but not integrated.
- **Recommendation**: Migrate StepWelcome and StepCombinedDetails to use `validateFormData(formDataSchema.partial(), data)` before submit.

### 9. **Dashboard Disclaimer Layout**
- **Discovery**: Fixed disclaimer adds `pt-14` to main content to prevent overlap. On small screens, content area is reduced.
- **Impact**: Acceptable; disclaimer is important for demo safety.
- **Recommendation**: Consider dismissible banner after first view, or move to a one-time modal.

### 10. **build Success**
- **Discovery**: `npm run build` succeeds. All new code compiles; `/api/ingest` is correctly registered.
- **Impact**: Prototype is deployable.
- **Recommendation**: Run E2E tests if available; manual smoke test of key flows.

---

## Comparison Snapshot

| Area | Before | After |
|------|--------|-------|
| Resume flow | No dedicated screen | StepResume with "Resume Your Journey" |
| Analytics | 404 on /api/ingest | 200, logs in dev, forward ready |
| Form defaults | Hardcoded PII | Empty; ?demo=true for sample data |
| OTP | Any 6 digits | 123456 in prod; any 6 in dev |
| Cross-sell | No action | trackEvent on click |
| Save & Continue | Banner only | Explicit button + notification |
| Video KYC camera fail | Stuck | Try again + branch fallback |
| Error handling | No boundary | StepErrorBoundary + Retry |
| Pincode | No feedback when unknown | Helper text |
| Whitelabel close | No warning | Confirm if unsaved |
| PII disclaimer | None | Dashboard banner |
| Token security | No signing | Optional HMAC when secret set |
| Audit events | None | Tagged for ingest |
| Metadata | Static | Dynamic for /journey/[inviteId] |

---

## Suggested Next Steps (Priority Order)

1. **Wire formDataSchema** into StepWelcome and StepCombinedDetails submit logic.
2. **Add "Load demo data"** CTA on Dashboard or first step when form empty.
3. **Server-side invite resolution** for token verification in production.
4. **Real OTP integration** for production resume flow.
5. **E2E or smoke tests** for NTB, ETB, ETB-NK, and resume flows.
