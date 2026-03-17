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
  const status = (profile.employmentStatus || "Active").toLowerCase();
  const isActive = status !== "terminated" && status !== "inactive" && status !== "resigned";
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

/** Pending HRMS updates for RM to review (e.g. after sync: income/grade change, new offers). */
const PENDING_UPDATES_KEY = "mmfsl_rm_pending_updates";
export interface PendingHrmsUpdate {
  employeeId: string;
  employeeName?: string;
  changes: string[];
  profileBefore: Partial<SyncedEmployeeData> | null;
  profileAfter: SyncedEmployeeData;
  offersAfter: BreOffer;
  syncedAt: string;
}

export function getPendingUpdates(employeeId: string): PendingHrmsUpdate | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PENDING_UPDATES_KEY);
    const all: Record<string, PendingHrmsUpdate> = raw ? JSON.parse(raw) : {};
    return all[employeeId] ?? null;
  } catch {
    return null;
  }
}

export function getAllPendingUpdateEmployeeIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PENDING_UPDATES_KEY);
    const all: Record<string, PendingHrmsUpdate> = raw ? JSON.parse(raw) : {};
    return Object.keys(all);
  } catch {
    return [];
  }
}

export function setPendingUpdates(employeeId: string, data: PendingHrmsUpdate): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(PENDING_UPDATES_KEY);
    const all: Record<string, PendingHrmsUpdate> = raw ? JSON.parse(raw) : {};
    all[employeeId] = data;
    localStorage.setItem(PENDING_UPDATES_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function clearPendingUpdates(employeeId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(PENDING_UPDATES_KEY);
    const all: Record<string, PendingHrmsUpdate> = raw ? JSON.parse(raw) : {};
    delete all[employeeId];
    localStorage.setItem(PENDING_UPDATES_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

/** Notification to employee that offers have been updated (RM clicked "Trigger offers"). */
const OFFER_NOTIFICATION_KEY_PREFIX = "mmfsl_employee_offer_notification_";
export interface EmployeeOfferNotification {
  at: string;
  message: string;
}

export function setEmployeeOfferNotification(employeeId: string, payload?: Partial<EmployeeOfferNotification>): void {
  if (typeof window === "undefined") return;
  try {
    const data: EmployeeOfferNotification = {
      at: new Date().toISOString(),
      message: "Your offers have been updated based on your latest profile. Check your dashboard.",
      ...payload,
    };
    localStorage.setItem(OFFER_NOTIFICATION_KEY_PREFIX + employeeId, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function getEmployeeOfferNotification(employeeId: string): EmployeeOfferNotification | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(OFFER_NOTIFICATION_KEY_PREFIX + employeeId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearEmployeeOfferNotification(employeeId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(OFFER_NOTIFICATION_KEY_PREFIX + employeeId);
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
 * Run HRMS sync: generate random new values for all employees.
 * - Employee #1 (index 0): forced to Resigned → MMFSL profile/offers reflect resigned state.
 * - Employee #2 (index 1): increased income band + promoted → pending update stored for RM "Updates" popup.
 */
export function runSync(
  employees: EmployeeLike[],
  employeeStatuses: Record<string, StatusLike>
): { syncedAt: string } {
  const syncedAt = new Date().toISOString();
  const synced: Record<string, SyncedEmployeeData> = {};
  const triggers: Record<string, TriggerEvent[]> = {};
  const offers: Record<string, BreOffer> = {};

  const previousSynced = typeof window !== "undefined" ? getSyncedEmployees() : {};

  employees.forEach((emp, index) => {
    const h = hash(emp.id + syncedAt.slice(0, 10));
    const baseIncome = parseInt(emp.income || "1200000", 10);
    const salaryBands = ["Band A", "Band B", "Band C", "Band D", "Band E"];
    let band = salaryBands[h % salaryBands.length];
    const salaryDelta = (h % 15) - 5;
    let newSalary = Math.max(600000, Math.min(4000000, baseIncome + salaryDelta * 50000));
    const designations = ["Senior Associate", "Associate", "Manager", "Senior Manager", "Lead", "Specialist"];
    let newDesignation = designations[h % designations.length];
    const depts = ["Technology", "Finance", "Operations", "Marketing", "Human Resources", "Sales"];
    let newDept = depts[h % depts.length];
    const statuses = ["Active", "Active", "Active", "On Notice", "Terminated"];
    let newStatus = statuses[h % statuses.length];

    // Employee #1: force Resigned so MMFSL profile changes (no active offers)
    if (index === 0) {
      newStatus = "Resigned";
    }
    // Employee #2: increase income band + promote (for RM "Updates" trigger)
    if (index === 1) {
      band = "Band A";
      newSalary = Math.max(1800000, Math.min(3500000, baseIncome * 2 + (h % 5) * 100000));
      newDesignation = "Senior Manager";
      newStatus = "Active";
    }

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
    const active = newStatus === "Active";
    const gradeNum = band === "Band A" ? 1 : band === "Band B" ? 2 : band === "Band C" ? 3 : band === "Band D" ? 4 : 5;

    if (status === "completed") {
      const empTriggers: TriggerEvent[] = [];
      if (newStatus === "Resigned") {
        empTriggers.push({
          type: "NACH_RESIGNATION",
          label: "NACH – Resignation",
          description: "Employee resigned; NACH and loan rules applied per BRE.",
          date: syncedAt,
          source: "MMFSL LMS",
        });
      } else if (newStatus === "On Notice") {
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
    }

    if (active) {
      const topUpEligible = newSalary >= 800000;
      const topUpAmount = topUpEligible ? Math.min(800000, Math.round(newSalary * (0.1 + gradeNum * 0.02))) : undefined;
      offers[emp.id] = {
        topUpEligible: !!topUpEligible,
        topUpAmount,
        carLoanEligible: newSalary >= 600000,
        homeLoanEligible: newSalary >= 1200000 && gradeNum >= 2,
        updatedTerms: topUpEligible ? "Eligibility based on your current salary and grade." : undefined,
        syncedAt,
      };
    } else {
      offers[emp.id] = {
        topUpEligible: false,
        carLoanEligible: false,
        homeLoanEligible: false,
        syncedAt,
      };
    }

    // Store pending update for employee #2 so RM sees "Updates" and can trigger offers to employee
    if (index === 1 && typeof window !== "undefined") {
      const prev = previousSynced[emp.id] ?? null;
      const changes: string[] = [];
      if (!prev || prev.salary !== newSalary) changes.push(`Salary updated to ₹${(newSalary / 100000).toFixed(1)}L`);
      if (!prev || prev.band !== band) changes.push(`Band: ${band}`);
      if (!prev || prev.designation !== newDesignation) changes.push(`Designation: ${newDesignation}`);
      if (!prev || prev.employmentStatus !== newStatus) changes.push(`Status: ${newStatus}`);
      if (changes.length === 0) changes.push("Income band increased and promoted (Senior Manager).");
      setPendingUpdates(emp.id, {
        employeeId: emp.id,
        employeeName: (emp as { name?: string }).name,
        changes,
        profileBefore: prev ? { salary: prev.salary, band: prev.band, designation: prev.designation, employmentStatus: prev.employmentStatus } : null,
        profileAfter: synced[emp.id],
        offersAfter: offers[emp.id],
        syncedAt,
      });
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
