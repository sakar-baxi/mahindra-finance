# Business Requirements Document (BRD): Journey Builder

**Product:** HDFC Bank Salary Account Journey Platform — Journey Builder  
**Document Type:** BRD (Business Requirements Document)  
**Version:** 1.0  
**Date:** February 2026  
**Status:** Draft  
**Owner:** Business / Product  
**Related Document:** PRD_JOURNEYS_AND_JOURNEY_BUILDER_COMPLETE.md  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)  
2. [Business Context & Background](#2-business-context--background)  
3. [Problem Statement](#3-problem-statement)  
4. [Stakeholders](#4-stakeholders)  
5. [Business Objectives & Goals](#5-business-objectives--goals)  
6. [Scope](#6-scope)  
7. [Business Process (High-Level)](#7-business-process-high-level)  
8. [Benefits & Value Proposition](#8-benefits--value-proposition)  
9. [Assumptions](#9-assumptions)  
10. [Constraints](#10-constraints)  
11. [Dependencies](#11-dependencies)  
12. [Risks & Mitigation](#12-risks--mitigation)  
13. [Success Criteria & Business Metrics](#13-success-criteria--business-metrics)  
14. [High-Level Phases & Timeline](#14-high-level-phases--timeline)  
15. [Approval & Sign-Off](#15-approval--sign-off)  
16. [Appendix: Business Glossary](#16-appendix-business-glossary)  

---

## 1. Executive Summary

### 1.1 Purpose of This Document

This Business Requirements Document (BRD) defines the **business need**, **objectives**, **scope**, and **success criteria** for the **Journey Builder** — the configuration layer that allows the business to define and maintain customer journeys (NTB, ETB, ETB-NK) for salary account opening without relying on engineering for every change.

### 1.2 Summary

- **What:** A no-code/low-code Journey Builder that configures pages, sections, fields, data sources (including APIs), validations, and branding for three regulated customer journeys.  
- **Why:** To reduce time-to-market for journey changes, ensure regulatory compliance through configurable flows, and give business control over customer experience and integration with bank/partner APIs.  
- **Who benefits:** Bank (HDFC Bank), corporates (HR/RM), and end customers (employees).  
- **Outcome:** Configurable, compliant, consistent salary-account journeys with a single source of truth for flow and field behaviour, and measurable improvement in completion rates and operational efficiency.

### 1.3 Key Business Drivers

| Driver | Description |
|--------|-------------|
| **Speed to market** | Launch or change journey flows without full development cycles. |
| **Compliance** | Align steps, consents, and data capture with RBI and internal policies via configuration. |
| **Consistency** | Same journey experience whether the employee is invited from RM Portal, HR Portal, or direct link. |
| **Integration flexibility** | Connect to multiple APIs (bank, Tartan, third-party) with clear priority (main, fallback, additional). |
| **Customer experience** | Control prefill, validation, and copy so that journeys are clear and friction-appropriate. |

---

## 2. Business Context & Background

### 2.1 Industry & Regulatory Context

- **Salary account opening** is a core product for banks serving corporates. Flows must comply with RBI guidelines (KYC, AML, VCIP for Video KYC, etc.).  
- **Three distinct customer segments** drive three journey types:  
  - **NTB (New to Bank):** First-time customers; full KYC and account opening.  
  - **ETB (Existing to Bank):** Existing customers; minimal steps, often auto-conversion.  
  - **ETB-NK (Existing to Bank, No KYC):** Existing customers who need KYC; hybrid flow.  
- **Multiple entry points:** Employees may be invited from **RM Portal** (relationship managers), **HR Portal** (corporate HR), or **direct links**. The business requires the **same journey** for the same segment regardless of entry point.

### 2.2 Current State (As-Is)

- Journeys are implemented as **coded flows** (steps, fields, validations).  
- **Changes** to steps, fields, labels, validations, or API wiring typically require **development and deployment**.  
- **Branding**, legal text, and CTA labels may be partially configurable but **field-level behaviour** (e.g. prefill from API, validation rules, document upload rules) is not fully in business control.  
- **API integration** (main vs fallback vs additional) and **priority order** are not exposed in a single, clear configuration model.

### 2.3 Desired State (To-Be)

- **Journey Builder** provides a single place to:  
  - Define **pages (steps)** and **sections** within pages.  
  - Configure **fields** (type, source, prefill, validation, document upload, API mapping).  
  - Set **API priority** (Main, Fallback, Additional) per field or step.  
  - Manage **branding**, **legal text**, **CTA labels**, and **step titles**.  
- **Default journeys** for NTB, ETB, and ETB-NK are **pre-loaded** and **editable**; no code change needed for most business-driven changes.  
- **Compliance** is maintained through configurable consent text, step order, and field rules (e.g. Aadhaar never pre-filled on Welcome).

---

## 3. Problem Statement

### 3.1 Business Problem

- **Long lead time** to change journey steps, fields, validations, or integrations — every change goes through development, testing, and release.  
- **Inconsistent experience** risk when journeys are touched in code in different places or when entry points (RM vs HR vs direct) are updated at different times.  
- **Limited business ownership** of customer-facing copy, validation messages, and prefill behaviour — these remain in technical specs and code.  
- **Rigid API usage** — no standardised way to define main vs fallback vs additional APIs, leading to ad-hoc logic and harder compliance/audit.

### 3.2 Impact of Not Solving

- Delayed rollout of new products or policy changes.  
- Higher cost of change and higher risk of regression.  
- Difficulty in proving that all entry points and segments follow the same compliant flow.  
- Slower response to regulatory or partner API changes.

### 3.3 Statement of Need

The business needs a **Journey Builder** that allows authorised users to:

1. **Define and edit** the structure of all three journeys (NTB, ETB, ETB-NK) — pages, sections, and fields.  
2. **Configure** each field’s type (input, document upload, API-driven), data source, prefill behaviour, and validation rules.  
3. **Specify** API usage in a **priority order** (Main, Fallback, Additional) with clear business meaning.  
4. **Control** branding, legal text, and CTA labels so that journey look-and-feel and compliance copy can be updated without code.  
5. **Load and modify** default journeys so that new clients or segments can be onboarded quickly.

---

## 4. Stakeholders

### 4.1 Stakeholder Matrix

| Stakeholder | Role | Interest | Influence | Communication |
|-------------|------|----------|-----------|----------------|
| **Bank (HDFC Bank) Product** | Product owner | Journey design, compliance, UX | High | Requirements, acceptance, prioritisation |
| **Bank Compliance / Legal** | Compliance owner | Regulatory alignment, consent text, data handling | High | Review of flows and legal copy |
| **Corporate HR** | Client (enterprise) | Invite employees, see status | Medium | Training, support, feedback |
| **Relationship Managers (RM)** | Bank / corporate | Invite employees, manage corporates | Medium | Training, support, feedback |
| **Employees (End Users)** | Customers | Complete journey with minimal friction | High (indirect) | UX research, analytics |
| **Super Admin / Configurator** | Back-office | Configure journeys in builder | High | Training, access, change process |
| **Technology / Engineering** | Delivery | Build and maintain builder & journeys | High | PRD, technical design, releases |
| **Operations / Support** | Support | Handle queries, monitor completion | Medium | Runbooks, dashboards |

### 4.2 Stakeholder Goals (Summary)

- **Product:** Faster changes, compliant defaults, single source of truth.  
- **Compliance/Legal:** Auditable configuration of steps and consent; no hard-coded bypasses.  
- **HR/RM:** Reliable invite flow and status visibility; same experience for all employees.  
- **Employees:** Clear, short, secure journey; progress saved; no duplicate asks.  
- **Configurator:** Intuitive builder; safe defaults; ability to map APIs and validations.  
- **Technology:** Clear requirements (PRD), maintainable config model, testable behaviour.

---

## 5. Business Objectives & Goals

### 5.1 Primary Business Objectives

| ID | Objective | Measurable Target |
|----|-----------|-------------------|
| OBJ-1 | Reduce time to change journey (steps, fields, copy, APIs) | Configuration-only changes in &lt; 1 release cycle; no code for standard edits |
| OBJ-2 | Ensure regulatory alignment of all three journeys | Steps and consents configurable; audit trail of config used per journey run (future) |
| OBJ-3 | Provide a single, consistent experience across entry points | Same step sequence and field set for a given journey type (NTB/ETB/ETB-NK) |
| OBJ-4 | Enable API-driven prefill and fallback without code | Main / Fallback / Additional APIs configurable per field; business-defined priority |
| OBJ-5 | Improve journey completion and reduce drop-off | Measurable improvement in completion rate and drop-off by step (see Section 13) |

### 5.2 Secondary Business Objectives

- **Branding control:** Bank and corporate branding (logo, colours, fonts) configurable in builder.  
- **Validation control:** Business-defined validation rules and error messages.  
- **Document upload control:** Allowed file types, size limits, and instructions configurable.  
- **CTA control:** All button labels (Continue, Verify OTP, etc.) configurable.

### 5.3 Alignment with Strategy

- **Digital-first:** Builder supports rapid iteration of digital journeys.  
- **Compliance by design:** Configurable steps and consent support ongoing compliance.  
- **Scalability:** Same builder and config model can support more journey types or products later.

---

## 6. Scope

### 6.1 In Scope

| Area | Description |
|------|-------------|
| **Journey Builder application** | 4-step wizard: Journey & Bank, Branding, Structure (pages/steps), Fine-tune (fields, APIs, validations, CTAs, legal). |
| **Three journey types** | NTB, ETB, ETB-NK — structure, default steps, and default fields as defined in PRD. |
| **Page & section model** | Steps as pages; optional sections within a step for grouping fields. |
| **Field configuration** | Component type (input, document upload, API); input type; data source; prefill mode; validations; document upload rules; API priority (Main, Fallback, Additional). |
| **API configuration** | Per-field or per-step API definition: main, fallback, additional; endpoint, method, response mapping. |
| **Branding & copy** | Logo, colours, font, preset; step titles; CTA labels; legal and consent text. |
| **Default journeys** | Load default NTB, ETB, ETB-NK from builder; modify and save. |
| **Persistence** | Save and load configuration (backend or approved storage). |
| **Application of config** | Runtime journeys (employee-facing) consume saved config for steps, fields, validation, and APIs. |

### 6.2 Out of Scope (Explicit)

| Area | Reason |
|------|--------|
| **Conversational/AI journey execution** | Out of scope for this BRD; may be a separate initiative. |
| **Building net-new journey types** | Only NTB, ETB, ETB-NK are in scope; new types (e.g. savings-only) are future. |
| **End-user authentication/SSO** | Assumed handled by existing platform. |
| **Payment or disbursement flows** | Not part of journey builder scope. |
| **Audit log of config changes** | Desired but can be Phase 2 if not in initial release. |
| **Multi-tenancy (multiple banks)** | Single bank (HDFC Bank) in scope; multi-tenant builder is future. |
| **Localisation (multi-language)** | Single language (English) in scope unless otherwise agreed. |

### 6.3 Scope Boundaries

- **Builder users:** Super Admin / Configurator only; HR and RM do **not** edit journeys in builder.  
- **Journey consumers:** Employees (and optionally HR/RM viewing status); they do **not** see the builder.  
- **APIs:** Configuration of which APIs to call and in what order is in scope; implementation of new external API contracts is a separate dependency.

---

## 7. Business Process (High-Level)

### 7.1 Journey Configuration Process (Builder Use)

```
1. Configurator opens Journey Builder.
2. Select journey mode (form-based) and bank name; optionally apply preset (e.g. HDFC Bank).
3. Configure branding: logo, colours, font, presets.
4. In Structure: load default NTB/ETB/ETB-NK or edit existing steps (add/remove/reorder).
5. In Fine-tune: for each step, configure fields (type, source, prefill, API priority, validations); set module providers; set CTA labels, step titles, legal text.
6. Save configuration.
7. Configuration is used for subsequent employee journey runs (all entry points).
```

### 7.2 Employee Journey Process (Runtime)

```
1. Employee receives invite (from RM/HR or direct link) with journey type (NTB/ETB/ETB-NK).
2. Employee opens link; journey loads with saved config for that type.
3. Employee completes steps (Welcome → … → Complete) as defined in config.
4. Data is validated per configured rules; APIs are called per configured priority.
5. On completion, status is updated; HR/RM can see status in their portal.
```

### 7.3 Change Management (Business)

- **Standard change:** Configurator edits in builder → save → next run uses new config (subject to release/deploy if config is deployed with app).  
- **Governed change:** Compliance/Legal review of step order or consent text before configurator applies.  
- **Emergency rollback:** Ability to revert to previous config or to a known-good default (process to be defined).

---

## 8. Benefits & Value Proposition

### 8.1 Quantitative Benefits

| Benefit | Description | How Measured |
|---------|-------------|--------------|
| **Faster changes** | No code change for steps, fields, copy, validations, API mapping | Reduction in tickets/requests to engineering for journey changes |
| **Lower cost of change** | Fewer dev cycles per change | Cost per change (effort × rate) |
| **Higher completion rate** | Better UX and validation through config | % of started journeys that reach Complete (before vs after) |
| **Lower drop-off** | Identify and fix high-drop-off steps via config | Drop-off rate by step (analytics) |
| **Fewer defects** | Single config reduces divergence between entry points | Defects related to “wrong step” or “wrong field” |

### 8.2 Qualitative Benefits

- **Business ownership:** Product and Compliance can own journey design and copy.  
- **Compliance clarity:** Configurable consent and step order make it easier to demonstrate alignment with policy.  
- **Consistency:** One source of truth for each journey type.  
- **Flexibility:** New APIs or validation rules can be wired in through configuration where supported.  
- **Onboarding:** New corporates or segments can use default journeys with minimal customisation.

### 8.3 Value Proposition Statement

*“The Journey Builder gives the business direct control over salary-account journeys (NTB, ETB, ETB-NK), enabling faster, compliant, and consistent customer experiences while reducing dependency on engineering for routine journey changes.”*

---

## 9. Assumptions

| ID | Assumption | Owner |
|----|------------|--------|
| A1 | The platform already has authenticated access for Super Admin / Configurator and for employees. | Technology |
| A2 | RM Portal and HR Portal exist and can trigger journeys (invite) with a journey type. | Product |
| A3 | APIs (bank, Tartan, third-party) that will be configured are or will be available and documented. | Technology / Partners |
| A4 | Compliance/Legal will provide approved consent and legal text for default journeys. | Compliance |
| A5 | A single production configuration per journey type is acceptable (no A/B of full journey structure in v1). | Product |
| A6 | Configuration is stored in a persistent store (DB or approved cloud storage) and loaded at runtime. | Technology |
| A7 | Default NTB, ETB, ETB-NK flows (as in PRD) are accepted as the baseline by Compliance and Product. | Product / Compliance |
| A8 | Only English is required for v1. | Product |
| A9 | Build is for one bank (HDFC Bank); multi-bank support is not required for initial release. | Product |

---

## 10. Constraints

| ID | Constraint | Type |
|----|------------|------|
| C1 | Journey flows must comply with RBI and internal compliance policies. | Regulatory |
| C2 | Aadhaar must not be pre-filled on Welcome step (compliance). | Regulatory |
| C3 | After “Account Activated” step, only “Continue with Video KYC” is allowed (no skip). | Business |
| C4 | Welcome page must contain only name and phone number for NTB, ETB, ETB-NK. | Business |
| C5 | Builder access restricted to authorised roles (e.g. Super Admin / Configurator). | Security |
| C6 | No storage of full API keys in client-side or logs; secure handling of tokens. | Security |
| C7 | Timeline and budget as agreed with Technology and Product. | Project |
| C8 | Use of existing design system and technology stack where applicable. | Technical |

---

## 11. Dependencies

| ID | Dependency | Owner | Impact if Not Met |
|----|------------|--------|-------------------|
| D1 | Runtime journey engine consumes saved config (steps, fields, validation, API config). | Technology | Builder changes would not take effect. |
| D2 | RM Portal and HR Portal pass correct journey type (NTB/ETB/ETB-NK) when inviting. | Product / Technology | Wrong journey could be shown. |
| D3 | Availability of bank/Tartan/third-party API specs and test environments. | Technology / Partners | API configuration in builder cannot be fully validated. |
| D4 | Approved legal and consent copy for default journeys. | Compliance / Legal | Default config cannot be finalised. |
| D5 | Access control and role definitions for “Configurator” / “Super Admin”. | Technology / Security | Unauthorised changes possible. |
| D6 | Persistence layer for configuration (create, read, update, versioning). | Technology | Config cannot be saved or loaded. |

---

## 12. Risks & Mitigation

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R1 | Configurator misconfigures journey and causes compliance breach. | Medium | High | Governance: Compliance review for structural/consent changes; config validation before save; optional approval workflow. |
| R2 | API config errors (wrong endpoint, wrong mapping) cause runtime failures. | Medium | Medium | Validation in builder (e.g. path syntax); test/sandbox mode; clear error messages. |
| R3 | Default journeys become out of sync with regulatory updates. | Medium | High | Periodic Compliance review of default config; versioning and change log. |
| R4 | Scope creep (e.g. conversational flows, new journey types) delays delivery. | Medium | Medium | Strict scope (Section 6); change control; phased roadmap. |
| R5 | Low adoption of builder (teams still request code changes). | Low | Medium | Training, clear ownership, and show quick wins (e.g. CTA/label changes without release). |
| R6 | Performance or usability of builder affects productivity. | Low | Medium | UX review, performance criteria in PRD, iterative improvement. |

---

## 13. Success Criteria & Business Metrics

### 13.1 Success Criteria (Must Meet)

| ID | Criterion | Measurement |
|----|-----------|-------------|
| SC1 | All three journeys (NTB, ETB, ETB-NK) are configurable in builder and run correctly at runtime. | Test scenarios per journey type; no critical defects. |
| SC2 | Welcome page contains only name and phone; post–Account Activated only “Continue with Video KYC”. | Requirement verification / UAT. |
| SC3 | API priority (Main, Fallback, Additional) is configurable and applied at runtime. | Config + integration test. |
| SC4 | Field types (input, document upload, API), prefill mode, and validations are configurable and applied. | Config + UAT. |
| SC5 | Branding, CTA labels, step titles, and legal text are configurable and reflected in journey. | UAT. |
| SC6 | Default journeys can be loaded and modified without code. | UAT by Configurator. |
| SC7 | Same journey type yields same flow from RM Portal, HR Portal, and direct link. | E2E test. |

### 13.2 Business Metrics (Post-Release)

| Metric | Description | Target (Example) |
|--------|-------------|------------------|
| **Journey completion rate** | % of started journeys that reach Complete | Improve by X% over baseline within 6 months |
| **Drop-off by step** | % abandoning at each step | Identify and reduce top 2 drop-off steps |
| **Time to change** | Time from business request to live change (config-only) | &lt; 1 release cycle for standard changes |
| **Builder usage** | Number of config saves per month | Adoption by at least one designated Configurator |
| **Incidents** | Defects or incidents attributed to journey config | Zero critical; &lt; N high within 3 months |

### 13.3 Acceptance Criteria (Link to PRD)

Detailed acceptance criteria and test conditions are in the PRD (Section 12 and Section 5). This BRD’s success criteria align with those; UAT will validate both business and product requirements.

---

## 14. High-Level Phases & Timeline

| Phase | Scope | Outcome |
|-------|--------|---------|
| **Phase 1: Foundation** | Default journeys (NTB, ETB, ETB-NK) running from config; builder Step 1–3 (Journey & Bank, Branding, Structure). | Load default journeys; add/remove/reorder steps; branding applied. |
| **Phase 2: Field & API Configuration** | Builder Step 4 (Fine-tune): field configuration (type, source, prefill, validations); API priority (Main, Fallback, Additional); document upload. | Full field and API configuration without code. |
| **Phase 3: Polish & Governance** | Validation rules expansion; error messages; optional approval workflow; training and runbooks. | Production-ready governance and support. |

*Timeline and resource allocation to be agreed with Technology and Product; not fixed in this BRD.*

---

## 15. Approval & Sign-Off

This BRD requires sign-off from the following roles before development is considered approved against business requirements:

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| Compliance / Legal (as applicable) | | | |
| Technology Lead | | | |
| Programme / Project Manager | | | |

**Document approval does not imply approval of budget or timeline; those are subject to separate governance.**

---

## 16. Appendix: Business Glossary

| Term | Business Definition |
|------|---------------------|
| **Journey** | End-to-end digital process a customer completes (e.g. salary account opening from invite to completion). |
| **Journey Builder** | The configuration tool used by the business to define and maintain journey steps, fields, APIs, and copy. |
| **NTB** | New to Bank — customer segment with no existing relationship; full KYC and account opening. |
| **ETB** | Existing to Bank — customer segment with existing relationship; typically minimal steps and auto-conversion. |
| **ETB-NK** | Existing to Bank, No KYC — existing customer who must complete KYC before conversion. |
| **Step** | A single screen or page in the journey (e.g. Welcome, eKYC, Profile Details). |
| **Section** | A grouped set of fields within a step (e.g. “Income”, “Nominee”). |
| **Field** | A single data item collected (e.g. name, mobile, PAN, document upload). |
| **Main API** | The primary external system used to prefill or validate a field; tried first. |
| **Fallback API** | Backup system used if Main API fails or times out. |
| **Additional APIs** | Optional systems used to enrich data after Main (and optionally Fallback). |
| **Prefill** | Auto-populating a field from an API instead of (or in addition to) manual entry. |
| **Configurator** | Role that uses the Journey Builder to create or change journey configuration. |
| **RM Portal** | Portal used by Relationship Managers to manage corporates and invite employees. |
| **HR Portal** | Portal used by corporate HR to manage employees and invite them to journeys. |

---

*End of BRD.*
