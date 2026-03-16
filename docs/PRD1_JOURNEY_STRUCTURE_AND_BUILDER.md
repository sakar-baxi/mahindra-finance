# PRD 1: Journey Structure, Pages, Sections & Field Containerization

## Document Info
- **Version:** 1.0  
- **Date:** February 2026  
- **Product:** HDFC Bank Salary Account Journey Platform  

---

## 1. Executive Summary

This PRD defines the structure of the three primary customer journeys (NTB, ETB, ETB-NK), how they are organized into pages and sections, how fields are containerized, and how the Journey Builder enables configuration of these elements.

---

## 2. The Three Journeys

### 2.1 NTB (New to Bank) Journey

**Target:** First-time customers opening a salary account.

| Step Order | Page | Sections | Fields (Containerized) |
|------------|------|----------|-------------------------|
| 1 | Welcome | Identity Capture | Name, Mobile Number, OTP |
| 2 | KYC Choice | Selection | Aadhaar eKYC / Physical KYC |
| 3 | eKYC Handler | eKYC Form | PAN, DOB, Email, Aadhaar, OTP (single page) |
| 4 | Profile Details | Personal Info | Income, Nominee |
| 5 | Review | Summary | Read-only review of all fields |
| 6 | Account Activated | Account Info | CIF, Account Number, IFSC, Branch |
| 7 | Pre-approved Offers | Offers | Cross-sell offers |
| 8 | Video KYC | Verification | Consent, Video call |
| 9 | Complete | Confirmation | Success message |

**Field Containerization:**
- **Welcome:** Single section, 3 fields (name, mobile, OTP)
- **eKYC:** Single section, 5 fields in one container
- **Profile Details:** Two sections: Income & Nominee
- **Review:** Single read-only section with all prior data

---

### 2.2 ETB (Existing to Bank) Journey

**Target:** Existing customers with relationship; auto-conversion enabled.

| Step Order | Page | Sections | Fields (Containerized) |
|------------|------|----------|-------------------------|
| 1 | Welcome | Identity Capture | Name, Mobile Number only |
| 2 | Auto Conversion | Account Selection | Pre-filled account details, confirmation |
| 3 | Complete | Confirmation | Success message |

**Field Containerization:**
- **Welcome:** Single section, 2 fields (name, mobile)
- **Auto Conversion:** Single section, pre-filled from bank API
- **Complete:** No input fields

---

### 2.3 ETB-NK (Existing to Bank, No KYC) Journey

**Target:** Existing customers requiring KYC verification.

| Step Order | Page | Sections | Fields (Containerized) |
|------------|------|----------|-------------------------|
| 1 | Welcome | Identity Capture | Name, Mobile Number only |
| 2 | KYC Choice | Selection | Aadhaar eKYC / Physical KYC |
| 3 | eKYC / Physical | KYC Form | Same as NTB eKYC or Physical branch |
| 4 | Profile Details | Personal Info | Income, Nominee |
| 5 | Review | Summary | Read-only review |
| 6 | Account Activated | Account Info | CIF, Account Number, IFSC |
| 7 | Video KYC | Verification | Consent, Video call |
| 8 | Complete | Confirmation | Success message |

**Field Containerization:**
- Mirrors NTB structure where applicable
- Welcome and Profile Details are sectioned similarly

---

## 3. Page & Section Hierarchy

### 3.1 Conceptual Model

```
Journey
  └── Page (Step)
        └── Section (Container)
              └── Field (Input / Document / API-driven)
```

### 3.2 Page

- **Definition:** A single screen in the journey flow; corresponds to a "Step" in the builder.
- **Properties:** Title, Step Kind, Order, CTA label
- **Example:** "Welcome", "eKYC Handler", "Profile Details"

### 3.3 Section

- **Definition:** A logical grouping of fields within a page.
- **Properties:** Heading, Subheading, Order
- **Examples:**
  - "Personal Information" (Name, DOB, Address)
  - "Income & Nominee"
  - "Document Upload"

### 3.4 Field

- **Definition:** A single data capture point (input, document upload, dropdown, API-driven).
- **Properties:** Label, Type, Placeholder, Validation, Data Source, API config

---

## 4. Field Containerization

### 4.1 Principles

1. **Logical grouping:** Related fields in one section (e.g., KYC fields together).
2. **Progressive disclosure:** Sensitive fields (Aadhaar, PAN) after identity capture.
3. **Minimal friction:** Welcome page: name + mobile only; rest deferred.
4. **Regulatory alignment:** Consent fields grouped; KYC fields grouped.

### 4.2 Container Types

| Container | Purpose | Example Fields |
|-----------|---------|----------------|
| Identity | Name, mobile, OTP | Welcome, eKYC |
| KYC | PAN, DOB, Aadhaar, Email | eKYC Handler |
| Profile | Income, Nominee | Profile Details |
| Review | Read-only summary | Review Application |
| Documents | File uploads | Document Upload step |

---

## 5. How the Journey Builder Achieves This

### 5.1 Current Capabilities

- **Step Structure:** Add, remove, reorder steps (pages).
- **Field Mapping:** Per-step field layout (default per step kind).
- **Data Sources:** Bank API, Tartan API, Manual.
- **Field Rename:** Custom labels per field.
- **Module Providers:** Bank, Tartan, 3rd-party vendors.

### 5.2 Builder Support for Pages & Sections

| Builder Feature | Maps To | Purpose |
|-----------------|---------|---------|
| Step (Page) | StepConfig | Defines page title, order, step kind |
| Fields per Step | FieldConfig[] | Fields on that page |
| Step Kind | stepKind | Determines default layout (welcome, ekycHandler, etc.) |
| stepFieldLayouts | Per-step kind default | Pre-fills fields per step type |

### 5.3 Section Support (Future)

- **Section:** New entity between Step and Field.
- **Properties:** heading, subheading, order, fields[]
- **Builder UI:** Collapsible sections within each step; drag & drop fields between sections.

---

## 6. Journey Flow Diagram

```
NTB:
  Welcome → KYC Choice → [Aadhaar: eKYC | Physical: Branch] → Profile Details → Review → Account Activated → [Video KYC] → Complete

ETB:
  Welcome → Auto Conversion → Complete

ETB-NK:
  Welcome → KYC Choice → [eKYC | Physical] → Profile Details → Review → Account Activated → Video KYC → Complete
```

---

## 7. Success Criteria

- [ ] All three journeys follow the defined page/section hierarchy.
- [ ] Welcome page contains only name + mobile for NTB, ETB, ETB-NK.
- [ ] Fields are logically grouped in sections.
- [ ] Journey Builder allows configuring steps, fields, and (future) sections.
- [ ] Default layouts match regulatory and UX best practices.

---

## Appendix A: Step Kinds Reference

| Step Kind | Label | Default Fields |
|-----------|-------|----------------|
| welcome | Welcome / OTP | name, mobileNumber, otp |
| kycChoice | KYC Type Selection | — |
| ekycHandler | Aadhaar eKYC | pan, dob, email, aadhaarNumber, otp |
| profileDetails | Profile Details | income, nominee |
| reviewApplication | Review | Read-only |
| preApprovedOffers | Pre-approved Offers | — |
| videoKyc | Video KYC | — |
| complete | Complete | — |
