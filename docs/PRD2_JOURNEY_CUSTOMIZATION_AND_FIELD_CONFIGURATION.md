# PRD 2: Journey Customization, Field Configuration & API Integration

## Document Info
- **Version:** 1.0  
- **Date:** February 2026  
- **Product:** HDFC Bank Salary Account Journey Platform  

---

## 1. Executive Summary

This PRD defines the customization flow for journeys: starting with the default journey as-is, then allowing users to customize fields, define APIs, add fields from API responses, configure field types, validations, prefill behavior, and document uploads.

---

## 2. Customization Flow

### 2.1 Phase 1: Default Journey (As-Is)

- User selects journey type (NTB, ETB, ETB-NK).
- Default pages, sections, and fields are loaded.
- No custom APIs or field overrides.
- Journey is ready for use with standard bank/Tartan flows.

### 2.2 Phase 2: Customization

- User enables "Customize" for a journey or step.
- For each field they can:
  - Change field type (input, dropdown, document upload, API-driven).
  - Add API(s) with priority (Main, Fallback, Additional).
  - Choose prefill vs manual entry.
  - Add validations.
  - Add fields from API response.

---

## 3. API Selection (Priority-Based)

### 3.1 Categories

| Priority | Label | Purpose | Usage |
|----------|-------|---------|-------|
| 1 | **Main API** | Primary data source | Try first; use response for prefill. |
| 2 | **Fallback API** | Backup if main fails | Used when main returns error or timeout. |
| 3 | **Additional APIs** | Supplementary data | Optional; merge or enrich response. |

### 3.2 UI Behavior

- **Ordered list:** Main → Fallback → Additional.
- **Clear labels:** "Main API", "Fallback API", "Additional APIs (optional)".
- **Visual hierarchy:** Main highlighted; Fallback secondary; Additional subdued.
- **Validation:** Main API required; Fallback optional; Additional optional.

### 3.3 API Configuration (per API)

- **Name:** e.g., "KYC Verification API"
- **Method:** GET, POST, PUT, PATCH
- **Endpoint URL:** e.g., `https://api.example.com/v1/verify`
- **Headers (JSON):** `{ "Authorization": "Bearer ..." }`
- **API Token:** Bearer token or API key
- **Success Criteria (HTTP Codes):** 200, 201, etc.
- **Input Mapping:** Which field(s) provide request params

---

## 4. Field Types

### 4.1 Supported Types

| Type | Description | Use Case |
|------|-------------|----------|
| **Input Field** | Text, number, date, etc. | Name, email, phone, etc. |
| **Dropdown** | Single select from options | Marital status, occupation |
| **Document Upload** | File upload (PDF, JPG, etc.) | ID proof, address proof |
| **API-driven** | Data from API; optional prefill | KYC data, account details |

### 4.2 Input Field Sub-types

| Sub-type | Data Type | Validation Examples |
|----------|-----------|---------------------|
| String | Text | Min/max length, regex, email format |
| Number | Numeric | Min/max, integer, decimal |
| Date | Date | Date range, format (DD/MM/YYYY) |
| Phone | E.164 | 10 digits, country code |
| PAN | PAN format | Regex, 10 chars |
| Aadhaar | 12-digit | Regex, masked display |
| Boolean | Yes/No | — |

### 4.3 Document Upload Configuration

- **Allowed file types:** PDF, JPG, JPEG, PNG, DOC, DOCX
- **Max file size (MB):** e.g., 5
- **Instructions (optional):** "Please upload a clear copy of your ID"
- **Multiple files:** Yes/No

---

## 5. Prefill vs Manual Entry

### 5.1 Options

| Option | Description | When to Use |
|--------|-------------|-------------|
| **Prefill from API** | Field auto-populated from API response | User has existing data; reduce friction |
| **Manual entry** | User types/selects | No API or user chooses to edit |
| **Prefill + Editable** | Prefilled but user can change | Best of both; default for most cases |
| **Prefill + Read-only** | Prefilled, not editable | Verified data (e.g., from bank) |

### 5.2 UI Control

- **Toggle:** "Prefill from API" (Yes/No)
- **If Yes:** Select API (Main/Fallback/Additional) and response path (e.g., `data.name`).
- **Editable:** "Allow user to edit" (Yes/No).

---

## 6. Validation Rules

### 6.1 Available Validations

| Rule | Applicable To | Example |
|------|---------------|--------|
| Required | All | Field cannot be empty |
| Min length | String | Min 3 characters |
| Max length | String | Max 100 characters |
| Regex | String | PAN: `[A-Z]{5}[0-9]{4}[A-Z]` |
| Email format | Email | Standard email validation |
| Phone format | Phone | 10 digits, country code |
| Min value | Number | Min 0 |
| Max value | Number | Max 1000000 |
| Date range | Date | Not future, not before 1900 |
| File type | Document | PDF, JPG only |
| File size | Document | Max 5 MB |

### 6.2 Validation UI

- **"+ Add Validation"** button per field.
- **Rule type** dropdown.
- **Parameters** (e.g., min, max, regex) as inputs.
- **Error message** (custom per rule).

### 6.3 API Response Validation

- **Success criteria:** HTTP 200, 201, etc.
- **Error handling:** Show fallback UI or retry.
- **Response path:** JSON path for value (e.g., `response.data.name`).

---

## 7. Adding Fields from API Response

### 7.1 Flow

1. User selects "API" as component type.
2. User selects API (from Main/Fallback/Additional).
3. **Preview response:** Show sample response structure.
4. **Map response to fields:** User selects JSON paths for each field.
5. **Add fields:** Auto-create fields from response schema or manual mapping.

### 7.2 Example

- **API Response:** `{ "data": { "name": "John", "pan": "ABCDE1234F" } }`
- **Mapped fields:** Name → `data.name`, PAN → `data.pan`
- **Fields created:** Name (prefilled), PAN (prefilled)

---

## 8. CTA Button Configuration

- **CTA Text:** Continue, Submit, Verify OTP, etc.
- **CTA Color:** Primary, Secondary, etc.
- **CTA Icon:** None, Arrow, Check, etc.
- **Preview:** Live preview of button.

---

## 9. Journey Builder UX Enhancements

### 9.1 Page & Section Creation

- **Add Page:** Create new step in journey.
- **Add Section:** Create section within a page.
- **Drag & Drop:** Reorder pages, sections, fields.

### 9.2 Component Configuration

- **Component Type:** Input Field | Document Upload | API
- **Component Heading:** e.g., "Enter Your Details"
- **Component Subheading:** e.g., "We need some basic information"
- **Field-specific:** Type, placeholder, validations, API config

### 9.3 Visual Hierarchy

- **Pages:** Top-level cards; expand/collapse.
- **Sections:** Indented under pages; collapsible.
- **Fields:** List items within sections; inline edit.

---

## 10. Implementation Checklist

### Phase 1: Default Journey
- [x] NTB, ETB, ETB-NK default flows
- [x] Welcome: name + mobile only
- [x] Step structure in Journey Builder

### Phase 2: Field Types
- [ ] Input Field (String, Number, Date, etc.)
- [ ] Dropdown (options from config or API)
- [ ] Document Upload (file types, size, instructions)
- [ ] API-driven field

### Phase 3: API Selection
- [ ] Main API (required)
- [ ] Fallback API (optional)
- [ ] Additional APIs (optional)
- [ ] UI: Priority-based order, clear labels

### Phase 4: Prefill & Validation
- [ ] Prefill from API (with path mapping)
- [ ] Manual vs Prefill + Editable toggle
- [ ] Validation rules (required, min/max, regex, etc.)
- [ ] Custom error messages

### Phase 5: Pages & Sections
- [ ] Add sections within steps
- [ ] Drag & drop fields between sections
- [ ] Section heading/subheading

---

## Appendix A: Field Kind to Type Mapping

| Field Kind | Default Type | Allowed Overrides |
|------------|--------------|-------------------|
| name | String | — |
| mobileNumber | Phone | — |
| email | Email | — |
| dob | Date | — |
| pan | PAN | — |
| aadhaarNumber | Aadhaar | — |
| documentUpload | Document Upload | — |
| incomeRange | Dropdown | — |
| maritalStatus | Dropdown | — |

---

## Appendix B: API Response Schema Example

```json
{
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "pan": "ABCDE1234F",
    "dob": "1990-05-15"
  },
  "status": "success"
}
```

**Path mapping:** `data.name` → Name field, `data.pan` → PAN field, etc.
