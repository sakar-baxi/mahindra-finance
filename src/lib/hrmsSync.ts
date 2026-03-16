/**
 * HRMS sync and MMFSL LMS feedback: employment/income triggers and BRE loan rules.
 * When HR clicks "Sync now", employee data (salary, band, designation) is updated;
 * for employees who have taken a loan, triggers are generated and BRE rules applied.
 */

const SYNC_TIMESTAMP_KEY = "mmfsl_hrms_sync_timestamp";
const SYNCED_EMPLOYEES_KEY = "mmfsl_hrms_synced_employees";
const TRIGGERS_KEY = "mmfsl_lms_triggers";
const BRE_OFFERS_KEY = "mmfsl_bre_offers";

export interface SyncedEmployeeData {
  employeeId: string;
  salary: number;
  band: string;
  designation: string;
  department: string;
  employmentStatus: string;
  syncedAt: string;
}

export type TriggerType =
  | "INCOME_CHANGE"
  | "DESIGNATION_CHANGE"
  | "FUNCTION_CHANGE"
  | "EMPLOYMENT_STATUS_CHANGE"
  | "NACH_TERMINATION"
  | "NACH_RESIGNATION";

export interface TriggerEvent {
  type: TriggerType;
  label: string;
  description: string;
  date: string;
  source: "MMFSL LMS";
}

export interface BreOffer {
  topUpEligible: boolean;
  topUpAmount?: number;
  carLoanEligible: boolean;
  homeLoanEligible: boolean;
  updatedTerms?: string;
  syncedAt: string;
}

export function getSyncTimestamp(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SYNC_TIMESTAMP_KEY);
}

export function getSyncedEmployees(): Record<string, SyncedEmployeeData> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SYNCED_EMPLOYEES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getTriggers(employeeId: string): TriggerEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TRIGGERS_KEY);
    const all: Record<string, TriggerEvent[]> = raw ? JSON.parse(raw) : {};
    return all[employeeId] ?? [];
  } catch {
    return [];
  }
}

export function getBreOffers(employeeId: string): BreOffer | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BRE_OFFERS_KEY);
    const all: Record<string, BreOffer> = raw ? JSON.parse(raw) : {};
    return all[employeeId] ?? null;
  } catch {
    return null;
  }
}

/** Employee profile for computing offers when no synced data (salary, grade, etc.). */
export type EmployeeOfferProfile = {
  id: string;
  income?: string;
  grade?: string;
  designation?: string;
  department?: string;
  employmentStatus?: string;
};

/**
 * Compute BRE offers from employee profile (salary, grade) so each employee sees different offers.
 * Used when no synced offer exists, or to reflect latest data before sync.
 */
export function computeBreOffersFromProfile(profile: EmployeeOfferProfile): BreOffer {
  const salary = Math.max(0, parseInt(String(profile.income || "0").replace(/\D/g, ""), 10) || 600000);
  const gradeLevel = parseInt(String(profile.grade || "0").replace(/\D/g, ""), 10) || 3;
  const isActive = (profile.employmentStatus || "Active").toLowerCase() !== "terminated" && (profile.employmentStatus || "Active").toLowerCase() !== "inactive";
  const topUpEligible = isActive && salary >= 800000;
  const topUpAmount = topUpEligible ? Math.min(800000, Math.round(salary * (0.15 + gradeLevel * 0.02))) : undefined;
  const carLoanEligible = isActive && salary >= 600000;
  const homeLoanEligible = isActive && salary >= 1200000 && gradeLevel >= 2;
  return {
    topUpEligible: !!topUpEligible,
    topUpAmount,
    carLoanEligible,
    homeLoanEligible,
    updatedTerms: topUpEligible ? "Eligibility based on your current salary and grade." : undefined,
    syncedAt: new Date().toISOString(),
  };
}

/**
 * Get BRE offers for an employee: use synced offer if present, else compute from profile
 * so each selected employee sees different offers (top-up, etc.) based on salary, grade.
 */
export function getBreOffersForEmployee(employeeId: string, profile?: EmployeeOfferProfile | null): BreOffer | null {
  const stored = getBreOffers(employeeId);
  if (stored) return stored;
  if (profile && profile.id === employeeId) return computeBreOffersFromProfile(profile);
  return null;
}

const NUDGE_KEY_PREFIX = "mmfsl_nudge_";

export interface NudgePayload {
  nudgedAt: string;
  startStepId?: string;
  message?: string;
}

export function getNudge(employeeId: string): NudgePayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(NUDGE_KEY_PREFIX + employeeId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setNudge(employeeId: string, payload: NudgePayload): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NUDGE_KEY_PREFIX + employeeId, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function clearNudge(employeeId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(NUDGE_KEY_PREFIX + employeeId);
  } catch {
    /* ignore */
  }
}

/** Get current employee id for employee portal (most recent completed journey). */
export function getCurrentEmployeeIdFromJourney(): string | null {
  if (typeof window === "undefined") return null;
  let latest: { id: string; lastUpdated: string } | null = null;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith("employeeJourneyStatus_")) continue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const data = JSON.parse(raw);
      if (data.status !== "completed") continue;
      const id = key.replace("employeeJourneyStatus_", "");
      const lastUpdated = data.lastUpdated || "";
      if (!latest || lastUpdated > latest.lastUpdated) {
        latest = { id, lastUpdated };
      }
    } catch {
      /* ignore */
    }
  }
  return latest?.id ?? null;
}

type EmployeeLike = { id: string; name?: string; income?: string; designation?: string; department?: string; employmentStatus?: string };
type StatusLike = { status?: string };

function hash(s: string): number {
  return s.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

/**
 * Run HRMS sync: update salary/band/designation for all employees;
 * for employees who have taken a loan, generate triggers and apply BRE rules (feedback from MMFSL LMS).
 */
export function runSync(
  employees: EmployeeLike[],
  employeeStatuses: Record<string, StatusLike>
): { syncedAt: string } {
  const syncedAt = new Date().toISOString();
  const synced: Record<string, SyncedEmployeeData> = {};
  const triggers: Record<string, TriggerEvent[]> = {};
  const offers: Record<string, BreOffer> = {};

  employees.forEach((emp) => {
    const h = hash(emp.id + syncedAt.slice(0, 10));
    const baseIncome = parseInt(emp.income || "1200000", 10);
    const salaryBands = ["Band A", "Band B", "Band C", "Band D", "Band E"];
    const band = salaryBands[h % salaryBands.length];
    const salaryDelta = (h % 15) - 5;
    const newSalary = Math.max(600000, Math.min(4000000, baseIncome + salaryDelta * 50000));
    const designations = ["Senior Associate", "Associate", "Manager", "Senior Manager", "Lead", "Specialist"];
    const newDesignation = designations[h % designations.length];
    const depts = ["Technology", "Finance", "Operations", "Marketing", "Human Resources", "Sales"];
    const newDept = depts[h % depts.length];
    const statuses = ["Active", "Active", "Active", "On Notice", "Terminated"];
    const newStatus = statuses[h % statuses.length];

    synced[emp.id] = {
      employeeId: emp.id,
      salary: newSalary,
      band,
      designation: newDesignation,
      department: newDept,
      employmentStatus: newStatus,
      syncedAt,
    };

    const status = employeeStatuses[emp.id]?.status;
    if (status === "completed") {
      const empTriggers: TriggerEvent[] = [];
      if (salaryDelta > 0) {
        empTriggers.push({
          type: "INCOME_CHANGE",
          label: "Salary updated",
          description: `Income revised (BRE applied for loan terms).`,
          date: syncedAt,
          source: "MMFSL LMS",
        });
      }
      if (newDesignation !== (emp.designation || "")) {
        empTriggers.push({
          type: "DESIGNATION_CHANGE",
          label: "Designation changed",
          description: `Function/designation update reflected.`,
          date: syncedAt,
          source: "MMFSL LMS",
        });
      }
      if (newDept !== (emp.department || "")) {
        empTriggers.push({
          type: "FUNCTION_CHANGE",
          label: "Function/Department change",
          description: `Department updated in HRMS.`,
          date: syncedAt,
          source: "MMFSL LMS",
        });
      }
      if (newStatus === "On Notice") {
        empTriggers.push({
          type: "NACH_RESIGNATION",
          label: "NACH – Resignation",
          description: "Employee on notice; NACH and loan rules applied per BRE.",
          date: syncedAt,
          source: "MMFSL LMS",
        });
      } else if (newStatus === "Terminated") {
        empTriggers.push({
          type: "NACH_TERMINATION",
          label: "NACH – Termination",
          description: "Employment terminated; NACH stop and BRE loan rules applied.",
          date: syncedAt,
          source: "MMFSL LMS",
        });
      }
      if (empTriggers.length > 0) triggers[emp.id] = empTriggers;

      const topUpEligible = salaryDelta > 0 && newStatus === "Active";
      const topUpAmount = topUpEligible ? Math.min(500000, Math.round(newSalary * 0.25)) : undefined;
      offers[emp.id] = {
        topUpEligible: !!topUpEligible,
        topUpAmount,
        carLoanEligible: newStatus === "Active" && newSalary >= 800000,
        homeLoanEligible: newStatus === "Active" && newSalary >= 1200000,
        updatedTerms: salaryDelta > 0 ? "Updated loan terms available based on new income." : undefined,
        syncedAt,
      };
    } else {
      // Offer data for all employees so portal shows different offers per salary/grade when data is updated
      const gradeNum = band === "Band A" ? 1 : band === "Band B" ? 2 : band === "Band C" ? 3 : band === "Band D" ? 4 : 5;
      const active = newStatus === "Active";
      const topUpEligible = active && newSalary >= 800000;
      const topUpAmount = topUpEligible ? Math.min(600000, Math.round(newSalary * (0.1 + gradeNum * 0.02))) : undefined;
      offers[emp.id] = {
        topUpEligible: !!topUpEligible,
        topUpAmount,
        carLoanEligible: active && newSalary >= 600000,
        homeLoanEligible: active && newSalary >= 1200000 && gradeNum >= 2,
        updatedTerms: undefined,
        syncedAt,
      };
    }
  });

  if (typeof window !== "undefined") {
    localStorage.setItem(SYNC_TIMESTAMP_KEY, syncedAt);
    localStorage.setItem(SYNCED_EMPLOYEES_KEY, JSON.stringify(synced));
    localStorage.setItem(TRIGGERS_KEY, JSON.stringify(triggers));
    localStorage.setItem(BRE_OFFERS_KEY, JSON.stringify(offers));
  }
  return { syncedAt };
}
