"use client";

import React from "react";
import ProfileSwitcher from "@/app/components/ProfileSwitcher";
import CorporateOnboarding, { type OnboardedCorporate } from "@/app/components/corporate/CorporateOnboarding";
import EmployeePortalContent from "@/app/components/EmployeePortalContent";
import { usePortal } from "@/app/context/PortalContext";
import {
    LayoutGrid,
    Link2,
    BarChart2,
    PieChart,
    Building2,
    Database,
    Webhook,
    Bug,
    Settings,
    ChevronRight,
    ExternalLink,
    ChevronLeft,
    ChevronDown,
    Search,
    Download,
    Filter,
    RefreshCcw,
    ArrowLeft,
    CheckCircle2,
    Clock,
    User,
    Users,
    X,
    UserCircle,
    XCircle,
    Rocket,
    Infinity,
    Plus,
    BarChart3,
    Package,
    Bell,
    Home,
    Zap,
    ListOrdered,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentEmployeeIdFromJourney, setNudge as setNudgeStorage } from "@/lib/hrmsSync";
import { DashboardPageContent } from "@/app/components/DashboardPageContent";

// ─── Types ──────────────────────────────────────────────────────────────

type JourneyKey = "ntb" | "etb" | "etb-nk" | "ntb-no-parents";

interface Employee {
    id: string;
    name: string;
    phone: string;
    email: string;
    journey: JourneyKey;
    inviteEndpoint?: string;
    dob: string;
    pan: string;
    fatherName: string;
    motherName: string;
    currentAddress: string;
    income: string;
    dateOfJoining: string;
    employmentType: string;
    gender: string;
    designation: string;
    department: string;
    grade: string;
    costCenter: string;
    jobLocationCity: string;
    employmentStatus: string;
    group?: string;
    companyName?: string;
    countryCode?: string;
    permanentAddress?: string;
    jobLocationPincode?: string;
    state?: string;
    marriageDate?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankIfscCode?: string;
    bankBranch?: string;
}

interface JourneyStatus {
    status: "in_progress" | "completed";
    currentStepTitle: string;
    currentStepId: string;
    journeyType: string;
    lastUpdated: string;
    name?: string;
    email?: string;
    phone?: string;
    dob?: string;
    pan?: string;
    fatherName?: string;
    motherName?: string;
    currentAddress?: string;
    income?: string;
    maritalStatus?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────

/** Derive bank name from IFSC when bank name is missing (e.g. from HRMS). */
function getBankNameFromIfsc(ifsc: string | undefined | null): string | null {
    if (!ifsc || typeof ifsc !== "string") return null;
    const prefix = (ifsc.slice(0, 4) || "").toUpperCase();
    const map: Record<string, string> = {
        IDFB: "IDFC FIRST Bank",
        HDFC: "HDFC Bank",
        SBIN: "State Bank of India",
        ICIC: "ICICI Bank",
        UTIB: "Axis Bank",
        KKBK: "Kotak Mahindra Bank",
        PUNB: "Punjab National Bank",
        BARB: "Bank of Baroda",
        CNRB: "Canara Bank",
        INDB: "IndusInd Bank",
        YESB: "Yes Bank",
    };
    return map[prefix] ?? null;
}

/** Mask account number for display: XXXXXXXX1234 */
function maskAccountNumber(account: string | undefined | null): string {
    if (!account || typeof account !== "string") return "NOT AVAILABLE";
    const s = String(account).replace(/\D/g, "");
    if (s.length < 4) return "XXXX";
    return "XXXXXXXX" + s.slice(-4);
}

function getJourneyCategory(journey: string): {
    label: "NTB" | "ETB: Auto Conv." | "ETB with KYC" | "NTB - Alternate";
    className: string;
} {
    switch (journey) {
        case "ntb":
            return {
                label: "NTB",
                className: "bg-dashboard-primary-light text-dashboard-primary border border-dashboard-primary/30",
            };
        case "ntb-no-parents":
            return {
                label: "NTB - Alternate",
                className: "bg-dashboard-primary-light text-dashboard-primary border border-dashboard-primary/30",
            };
        case "etb":
            return {
                label: "ETB: Auto Conv.",
                className: "bg-slate-50 text-slate-700 border border-slate-200",
            };
        case "etb-nk":
        default:
            return {
                label: "ETB with KYC",
                className: "bg-dashboard-primary-light text-dashboard-primary border border-dashboard-primary/30",
            };
    }
}

function getStatusBadge(empId: string, invited: boolean, statuses: Record<string, JourneyStatus>) {
    const status = statuses[empId];
    if (status?.status === "completed") {
        return { label: "Completed", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" };
    }
    if (status?.status === "in_progress") {
        return { label: status.currentStepTitle, className: "bg-dashboard-primary-light text-dashboard-primary border border-dashboard-primary/30" };
    }
    if (invited) {
        return { label: "Invited", className: "bg-amber-50 text-amber-700 border border-amber-200" };
    }
    return { label: "Not Started", className: "bg-slate-100 text-slate-600 border border-slate-200" };
}

const ITEMS_PER_PAGE = 10;
const CONNECTIONS_PER_PAGE = 10;

import { getSeedEmployees, SEED_CORPORATES } from "@/lib/seedEmployees";
import { runSync, getSyncTimestamp } from "@/lib/hrmsSync";

// Max 3 corporates for seed data; new corporates added via onboarding get different employee records
const CORPORATES = SEED_CORPORATES;

// Corporates table: 3 seed corporates (HRMS/KYB summary)
const CORPORATES_TABLE_BASE: Array<{ corporateName: string; categories: string; connections: string; status: "Active" | "Pending"; contactName: string; dateAdded: string; corpCategory: "CAT A" | "CAT B" | "CAT C"; kybStatus: "Verified" | "Pending" | "In Review" }> = [
    { corporateName: "Chola Business Services", categories: "HRIS", connections: "Keka", status: "Active", contactName: "", dateAdded: "Feb 19, 2026", corpCategory: "CAT A", kybStatus: "Verified" },
    { corporateName: "SCONE", categories: "HRIS", connections: "Keka", status: "Active", contactName: "", dateAdded: "Feb 18, 2026", corpCategory: "CAT B", kybStatus: "Verified" },
    { corporateName: "First Corp", categories: "HRIS", connections: "Keka", status: "Active", contactName: "", dateAdded: "Feb 17, 2026", corpCategory: "CAT A", kybStatus: "Verified" },
];
const CORPORATES_TABLE_DATA = CORPORATES_TABLE_BASE;

// Mock connections data (for Connections page)
const MOCK_CONNECTIONS = [
    { id: "1b3c9560-657c-4384-b470-9ff5b832dfe7", corporate: "hello need corpor", dateOfConnection: "19th February, 03:59 PM", integration: "-", csm: "After Deploy", lastSynced: "-", syncFreq: "WEEKLY", status: "Pending" as const, stepsStatus: "Mode Selection" },
    { id: "72c2359e-c5db-4ff2-a85d-c50f580cf3f4", corporate: "hello need corpor", dateOfConnection: "19th February, 03:58 PM", integration: "-", csm: "After Deploy", lastSynced: "-", syncFreq: "WEEKLY", status: "Pending" as const, stepsStatus: "Data Selection" },
    { id: "17477ff7-b57f-4552-b533-23556a3b4ded", corporate: "SCONE", dateOfConnection: "19th February, 01:37 PM", integration: "-", csm: "After Deploy", lastSynced: "-", syncFreq: "WEEKLY", status: "Pending" as const, stepsStatus: "Mode Selection" },
    { id: "20ad02e5-0a1d-4dcc-8890-cd186db2f50d", corporate: "First Corp", dateOfConnection: "19th February, 01:35 PM", integration: "-", csm: "After Deploy", lastSynced: "-", syncFreq: "WEEKLY", status: "Pending" as const, stepsStatus: "Mode Selection" },
    { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", corporate: "KLF", dateOfConnection: "18th February, 02:20 PM", integration: "DarwinBox", csm: "After Deploy", lastSynced: "18th Feb, 02:25 PM", syncFreq: "DAILY", status: "Active" as const, stepsStatus: "Complete" },
    { id: "b2c3d4e5-f6a7-8901-bcde-f12345678901", corporate: "Makemytrip Private Limited", dateOfConnection: "18th February, 10:15 AM", integration: "BambooHR", csm: "After Deploy", lastSynced: "17th Feb, 11:00 PM", syncFreq: "WEEKLY", status: "Active" as const, stepsStatus: "Complete" },
    { id: "c3d4e5f6-a7b8-9012-cdef-123456789012", corporate: "kial", dateOfConnection: "17th February, 04:30 PM", integration: "-", csm: "After Deploy", lastSynced: "-", syncFreq: "WEEKLY", status: "Terminated" as const, stepsStatus: "-" },
];
// Pad to 151 for screenshot match
const PAD_CONNECTIONS = Array.from({ length: 144 }, (_, i) => ({
    id: `pad-${i}-${(i * 7 + 13).toString(36)}`, corporate: CORPORATES[i % CORPORATES.length],
    dateOfConnection: `${(i % 28) + 1}th January, ${(i % 12) + 9}:${(i % 60).toString().padStart(2, "0")} ${i % 2 ? "AM" : "PM"}`,
    integration: i % 3 ? "BambooHR" : "-", csm: "After Deploy", lastSynced: i % 4 ? `${(i % 28)}th Jan` : "-",
    syncFreq: i % 2 ? "WEEKLY" : "DAILY", status: (i % 5 === 0 ? "Terminated" : i % 3 === 0 ? "Active" : "Pending") as "Active" | "Pending" | "Terminated",
    stepsStatus: i % 3 ? "Complete" : "Mode Selection"
}));
const ALL_CONNECTIONS = [...MOCK_CONNECTIONS, ...PAD_CONNECTIONS];

// HRMS integrations - full catalogue for integrations page (status kept internal, not shown in UI)
const HRMS_INTEGRATIONS = [
    { name: "ADP Workforce Now", status: "internal" as const },
    { name: "Adrenalin", status: "internal" as const },
    { name: "AlexisHR", status: "internal" as const },
    { name: "Altera Payroll", status: "internal" as const },
    { name: "BambooHR", status: "internal" as const },
    { name: "Beehive", status: "internal" as const },
    { name: "Breathe HR", status: "internal" as const },
    { name: "Ceridian Dayforce", status: "internal" as const },
    { name: "Charlie HR", status: "internal" as const },
    { name: "ChartHop", status: "internal" as const },
    { name: "ClayHR", status: "internal" as const },
    { name: "DarwinBox", status: "internal" as const },
    { name: "Deel", status: "internal" as const },
    { name: "EasyHR", status: "internal" as const },
    { name: "Elate HRMS", status: "internal" as const },
    { name: "Factorial", status: "internal" as const },
    { name: "FactoHR", status: "internal" as const },
    { name: "FreshTeam", status: "internal" as const },
    { name: "Google Workspace", status: "internal" as const },
    { name: "GreytHR", status: "internal" as const },
    { name: "Gulf HR", status: "internal" as const },
    { name: "HiBob", status: "internal" as const },
    { name: "HONO", status: "internal" as const },
    { name: "HR Cloud", status: "internal" as const },
    { name: "HR Partner", status: "internal" as const },
    { name: "HROne", status: "internal" as const },
    { name: "247HRM", status: "internal" as const },
    { name: "Humaans", status: "internal" as const },
    { name: "Humantiz", status: "internal" as const },
    { name: "IntelliHR", status: "internal" as const },
    { name: "JumpCloud", status: "internal" as const },
    { name: "Justworks", status: "internal" as const },
    { name: "Keka", status: "internal" as const },
    { name: "Lano", status: "internal" as const },
    { name: "Lucca", status: "internal" as const },
    { name: "MS Entra ID", status: "internal" as const },
    { name: "Namely", status: "internal" as const },
    { name: "Nmbrs", status: "internal" as const },
    { name: "Odoo", status: "internal" as const },
    { name: "Officient", status: "internal" as const },
    { name: "Okta", status: "internal" as const },
    { name: "Onelogin", status: "internal" as const },
    { name: "Oracle Fusion", status: "internal" as const },
    { name: "Paybooks", status: "internal" as const },
    { name: "Paychex", status: "internal" as const },
    { name: "Paycor", status: "internal" as const },
    { name: "Paylite HRMS", status: "internal" as const },
    { name: "PeopleHR", status: "internal" as const },
    { name: "PeopleHum", status: "internal" as const },
    { name: "PeopleStrong", status: "internal" as const },
    { name: "Peopleworks", status: "internal" as const },
    { name: "Personio", status: "internal" as const },
    { name: "Pocket", status: "internal" as const },
    { name: "Proliant", status: "internal" as const },
    { name: "Qandle", status: "internal" as const },
    { name: "RazorPay", status: "internal" as const },
    { name: "Rippling", status: "internal" as const },
    { name: "Sage HR", status: "internal" as const },
    { name: "Sapling", status: "internal" as const },
    { name: "Sesame", status: "internal" as const },
    { name: "Square Payroll", status: "internal" as const },
    { name: "Successfactors", status: "internal" as const },
    { name: "SumHr", status: "internal" as const },
    { name: "TriNet", status: "internal" as const },
    { name: "UKG Pro", status: "internal" as const },
    { name: "UKG Ready", status: "internal" as const },
    { name: "Uknowva", status: "internal" as const },
    { name: "Workday", status: "internal" as const },
    { name: "Workline", status: "internal" as const },
    { name: "Yomly", status: "internal" as const },
    { name: "Zenefits", status: "internal" as const },
    { name: "Zimyo", status: "internal" as const },
    { name: "ZingHR", status: "internal" as const },
    { name: "Zoho", status: "internal" as const },
];

// Mock diagnostics
const MOCK_DIAGNOSTICS = [
    { corporate: "KLF", connectionType: "HRMS", dataPosting: "Failed" as const, dataReceiving: "Failed" as const, authStatus: "Invalid" as const },
    { corporate: "kial", connectionType: "HRMS", dataPosting: "-" as const, dataReceiving: "-" as const, authStatus: "-" as const },
    { corporate: "Makemytrip Private Limited", connectionType: "HRMS", dataPosting: "-" as const, dataReceiving: "-" as const, authStatus: "-" as const },
    { corporate: "First Corp", connectionType: "HRMS", dataPosting: "-" as const, dataReceiving: "-" as const, authStatus: "-" as const },
    { corporate: "hello need corpor", connectionType: "HRMS", dataPosting: "Failed" as const, dataReceiving: "Success" as const, authStatus: "Valid" as const },
    { corporate: "SCONE", connectionType: "HRMS", dataPosting: "Failed" as const, dataReceiving: "Success" as const, authStatus: "Valid" as const },
    { corporate: "First Corp", connectionType: "HRMS", dataPosting: "Success" as const, dataReceiving: "Success" as const, authStatus: "Valid" as const },
];
const PAD_DIAGNOSTICS = Array.from({ length: 44 }, (_, i) => ({
    corporate: CORPORATES[i % CORPORATES.length], connectionType: "HRMS" as const,
    dataPosting: (i % 4 === 0 ? "Failed" : i % 3 === 0 ? "Success" : "-") as "Success" | "Failed" | "-",
    dataReceiving: (i % 5 === 0 ? "Failed" : i % 2 === 0 ? "Success" : "-") as "Success" | "Failed" | "-",
    authStatus: (i % 6 === 0 ? "Invalid" : i % 3 === 0 ? "Valid" : "-") as "Valid" | "Invalid" | "-",
}));
const ALL_DIAGNOSTICS = [...MOCK_DIAGNOSTICS, ...PAD_DIAGNOSTICS];

// ─── Employee Data (150+ per corporate, 3 corporates) ─────────────────────

const _seedEmployees = getSeedEmployees();
const employees: Employee[] = _seedEmployees.map((e) => ({
    ...e,
    inviteEndpoint: "/api/invites?variant=primary",
}));

// ─── Main Dashboard Component ───────────────────────────────────────────

type TabKey = "directory" | "accountOpened" | "analytics";
type PageKey = "dashboard" | "connections" | "reporting" | "corporates" | "integrations" | "data-models" | "webhooks" | "diagnostics" | "rm-employees" | "rm-products" | "rm-analytics" | "hr-overview" | "hr-employees";

const ONBOARDED_CORPORATES_KEY = "hdfc_onboarded_corporates";
const PORTAL_EMPLOYEE_ID_KEY = "mmfsl_portal_employee_id";
// All corporate employees are always synced to RM dashboard (no HR manual share required)
const HR_OWN_CORPORATE = "Chola Business Services"; // HR Portal sees only this corporate

type EmpPageKey = "dashboard" | "finagent" | "orders";

export default function Dashboard() {
    const { portalMode } = usePortal();
    const [invitedEmployeeIds, setInvitedEmployeeIds] = React.useState<Record<string, boolean>>({});
    const [activePage, setActivePage] = React.useState<PageKey>("dashboard");
    const [showCorporateOnboarding, setShowCorporateOnboarding] = React.useState(false);
    const [empActivePage, setEmpActivePage] = React.useState<EmpPageKey>("dashboard");
    const [onboardedCorporates, setOnboardedCorporates] = React.useState<OnboardedCorporate[]>(() => {
        if (typeof window === "undefined") return [];
        try {
            const raw = localStorage.getItem(ONBOARDED_CORPORATES_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch { return []; }
    });
    const [activeTab, setActiveTab] = React.useState<TabKey>("directory");
    const [selectedCorporate, setSelectedCorporate] = React.useState<string | null>(null);
    const [directoryPage, setDirectoryPage] = React.useState(1);
    const [accountOpenedPage, setAccountOpenedPage] = React.useState(1);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
    const [employeeStatuses, setEmployeeStatuses] = React.useState<Record<string, JourneyStatus>>({});
    const [lastHrSyncAt, setLastHrSyncAt] = React.useState<string | null>(() => (typeof window !== "undefined" ? getSyncTimestamp() : null));
    const [nudgeFeedback, setNudgeFeedback] = React.useState<string | null>(null);
    const [selectedPortalEmployeeId, setSelectedPortalEmployeeId] = React.useState<string | null>(() => {
        if (typeof window === "undefined") return null;
        try {
            const saved = localStorage.getItem(PORTAL_EMPLOYEE_ID_KEY);
            if (saved) return saved;
            const fromJourney = getCurrentEmployeeIdFromJourney();
            if (fromJourney) return fromJourney;
            return employees[0]?.id ?? null;
        } catch {
            return employees[0]?.id ?? null;
        }
    });
    // Read all employee journey statuses from localStorage
    const refreshStatuses = React.useCallback(() => {
        const statuses: Record<string, JourneyStatus> = {};
        employees.forEach((emp) => {
            try {
                const raw = localStorage.getItem(`employeeJourneyStatus_${emp.id}`);
                if (raw) {
                    statuses[emp.id] = JSON.parse(raw);
                }
            } catch { /* ignore parse errors */ }
        });
        setEmployeeStatuses(statuses);
    }, []);

    const handleHrSyncNow = React.useCallback(() => {
        const list = portalMode === "hr" ? employees.filter((e) => (e.companyName || "Chola Business Services") === HR_OWN_CORPORATE) : employees;
        const { syncedAt } = runSync(list, employeeStatuses);
        setLastHrSyncAt(syncedAt);
        refreshStatuses();
    }, [employeeStatuses, portalMode, refreshStatuses]);

    // Listen for cross-tab localStorage changes
    React.useEffect(() => {
        refreshStatuses();
        const onStorage = (e: StorageEvent) => {
            if (e.key?.startsWith("employeeJourneyStatus_")) {
                refreshStatuses();
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [refreshStatuses]);

    // Periodic polling for same-tab updates
    React.useEffect(() => {
        const interval = setInterval(refreshStatuses, 3000);
        return () => clearInterval(interval);
    }, [refreshStatuses]);

    // Refresh statuses when opening employee profile (ensures latest journey data is shown)
    React.useEffect(() => {
        if (selectedEmployee) refreshStatuses();
    }, [selectedEmployee?.id, refreshStatuses]);


    const handleRefreshInvites = React.useCallback(() => {
        setInvitedEmployeeIds({});
        refreshStatuses();
    }, [refreshStatuses]);

    // bfcache reset
    React.useEffect(() => {
        const onPageShow = (e: PageTransitionEvent) => {
            if (e.persisted) {
                setInvitedEmployeeIds({});
                refreshStatuses();
            }
        };
        window.addEventListener("pageshow", onPageShow);
        return () => window.removeEventListener("pageshow", onPageShow);
    }, [refreshStatuses]);

    // Filter employees based on search
    const filterEmployees = React.useCallback((list: Employee[]) => {
        if (!searchQuery.trim()) return list;
        const q = searchQuery.toLowerCase();
        return list.filter(
            (emp) =>
                emp.name.toLowerCase().includes(q) ||
                emp.id.toLowerCase().includes(q) ||
                emp.email.toLowerCase().includes(q) ||
                emp.phone.includes(q)
        );
    }, [searchQuery]);

    // Filtered lists
    const allFiltered = filterEmployees(employees);
    const completedEmployees = filterEmployees(
        employees.filter((emp) => employeeStatuses[emp.id]?.status === "completed")
    );

    // Pagination helpers
    const currentList = activeTab === "accountOpened" ? completedEmployees : allFiltered;
    const currentPage = activeTab === "accountOpened" ? accountOpenedPage : directoryPage;
    const setCurrentPage = activeTab === "accountOpened" ? setAccountOpenedPage : setDirectoryPage;
    const totalPages = Math.max(1, Math.ceil(currentList.length / ITEMS_PER_PAGE));
    const paginatedList = currentList.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const buildPrefilledInvite = (emp: Employee) => {
        const nameParts = (emp.name || "").trim().split(/\s+/);
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        return {
            journeyType: "personal-loan" as const,
            employee: { id: emp.id, name: emp.name, email: emp.email, phone: emp.phone },
            prefilledData: {
                employeeId: emp.id,
                name: emp.name,
                firstName,
                lastName,
                email: emp.email,
                mobileNumber: emp.phone,
                phone: emp.phone,
                dob: emp.dob,
                pan: emp.pan,
                fatherName: emp.fatherName,
                motherName: emp.motherName,
                currentAddress: emp.currentAddress,
                income: emp.income,
                state: emp.state,
                city: emp.jobLocationCity,
                pincode: emp.jobLocationPincode,
                department: emp.department,
                grade: emp.grade,
                bankName: emp.bankName,
                bankAccountNumber: emp.bankAccountNumber,
                bankIfscCode: emp.bankIfscCode,
                bankBranch: emp.bankBranch,
            },
        };
    };

    const handleInvite = (emp: Employee) => {
        if (invitedEmployeeIds[emp.id]) return;
        setInvitedEmployeeIds((prev) => ({ ...prev, [emp.id]: true }));
        try {
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith("hdfcJourney_")) keysToRemove.push(key);
            }
            keysToRemove.forEach((k) => localStorage.removeItem(k));
        } catch { /* ignore */ }
        const invite = buildPrefilledInvite(emp);
        localStorage.setItem("pendingInvite", JSON.stringify(invite));
        window.open("/", "_blank");
    };

    /** Retrigger journey from where employee left off (FTNR case management). */
    const handleRetriggerJourney = (emp: Employee) => {
        const status = employeeStatuses[emp.id] as (JourneyStatus & { currentStepId?: string }) | undefined;
        const startStepId = status?.status === "in_progress" ? status.currentStepId : undefined;
        try {
            const invite = { ...buildPrefilledInvite(emp), startStepId };
            localStorage.setItem("pendingInvite", JSON.stringify(invite));
            window.open("/journey/resume", "_blank");
        } catch { /* ignore */ }
    };

    /** Resume journey from employee portal (e.g. after nudge). Uses nudge startStepId if provided. */
    const handleResumeFromNudge = (emp: { id: string; name?: string; email?: string; phone?: string }, startStepId?: string | null) => {
        const fullEmp = employees.find((e) => e.id === emp.id);
        if (!fullEmp) return;
        try {
            const status = employeeStatuses[fullEmp.id] as (JourneyStatus & { currentStepId?: string }) | undefined;
            const stepId = startStepId ?? (status?.status === "in_progress" ? status.currentStepId : undefined);
            const invite = { ...buildPrefilledInvite(fullEmp), startStepId: stepId };
            localStorage.setItem("pendingInvite", JSON.stringify(invite));
            window.open("/journey/resume", "_blank");
        } catch { /* ignore */ }
    };

    /** Nudge employee to complete journey (FTNR – reminder). Employee sees notification in portal to resume + update documents. */
    const handleNudge = (emp: Employee) => {
        const status = employeeStatuses[emp.id] as (JourneyStatus & { currentStepId?: string }) | undefined;
        setNudgeStorage(emp.id, {
            nudgedAt: new Date().toISOString(),
            startStepId: status?.status === "in_progress" ? status.currentStepId : undefined,
            message: "Your RM has asked you to complete your application and submit any pending documents.",
        });
        setNudgeFeedback(`${emp.name} – reminder sent`);
        setTimeout(() => setNudgeFeedback(null), 3000);
    };

    const goToPage = (p: PageKey) => {
        setActivePage(p);
        setShowCorporateOnboarding(false);
        if (p !== "corporates") setSelectedCorporate(null);
        if (p === "dashboard" || p === "corporates") setActiveTab("directory");
        setDirectoryPage(1);
        setSearchQuery("");
    };

    React.useEffect(() => {
        if (portalMode === "employee") setEmpActivePage("dashboard");
        if (portalMode === "rm" && !["dashboard", "corporates", "rm-employees", "rm-products", "integrations"].includes(activePage)) setActivePage("dashboard");
        if (portalMode === "hr") {
            if (!["hr-overview", "hr-employees"].includes(activePage)) setActivePage("hr-overview");
            setSelectedCorporate(HR_OWN_CORPORATE);
        }
    }, [portalMode]);

    const handleAddNewCorporate = React.useCallback(() => {
        setShowCorporateOnboarding(true);
    }, []);

    const handleCorporateOnboardingComplete = React.useCallback((corporate: OnboardedCorporate) => {
        setOnboardedCorporates((prev) => {
            const next = [corporate, ...prev];
            try { localStorage.setItem(ONBOARDED_CORPORATES_KEY, JSON.stringify(next)); } catch { /* ignore */ }
            return next;
        });
        setShowCorporateOnboarding(false);
        setActivePage("corporates");
    }, []);

    const corporatesTableData = React.useMemo(() => {
        const onboarded = onboardedCorporates.map((c) => ({
            corporateName: c.corporateName,
            categories: c.categories,
            connections: c.connections,
            status: c.status,
            contactName: c.contactName,
            dateAdded: c.dateAdded,
            corpCategory: c.corpCategory,
            kybStatus: c.kybStatus,
        }));
        const all = [...onboarded, ...CORPORATES_TABLE_DATA];
        if (portalMode === "hr") {
            return all.filter((c) => c.corporateName === HR_OWN_CORPORATE);
        }
        return all;
    }, [onboardedCorporates, portalMode]);

    // ─── Employee Profile View (RM/corporates only; HR uses inline detail) ──
    // Must be after all hooks to avoid React error #300 (fewer hooks than expected)
    if (selectedEmployee && portalMode !== "hr") {
        return (
            <EmployeeProfile
                employee={selectedEmployee}
                journeyStatus={employeeStatuses[selectedEmployee.id] || null}
                onBack={() => setSelectedEmployee(null)}
            />
        );
    }

    // ─── Main Dashboard View ────────────────────────────────────────────
    const isRM = portalMode === "rm";

    return (
        <div className="dashboard-portal-theme flex h-screen w-full bg-white text-[#374151] font-manrope overflow-hidden">
            {/* Sidebar - RM vs HR */}
            <aside className="w-56 bg-white border-r border-[#E8EAED] flex flex-col flex-shrink-0 shadow-sm">
                <div className="px-4 py-4 border-b border-[#E5E7EB]">
                    {(portalMode === "employee" || portalMode === "hr") && (
                        <div className={cn("mb-4", "rounded-lg bg-[#F3F4F6] p-2")}>
                            <ProfileSwitcher />
                        </div>
                    )}
                        <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-dashboard-primary text-white")}>
                            <span className="font-bold text-sm">M</span>
                        </div>
                        <div>
                            <span className="font-semibold text-[#111827]">Mahindra Finance</span>
                            <p className="text-[10px] text-[#9CA3AF] mt-0.5">{portalMode === "employee" || portalMode === "hr" ? "Employee benefits" : "Corporate lending"}</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 py-4 px-2 overflow-y-auto">
                    {portalMode === "employee" ? (
                        <>
                            <SidebarNavItem icon={Home} label="Dashboard" active={empActivePage === "dashboard"} onClick={() => setEmpActivePage("dashboard")} />
                            <SidebarNavItem icon={Zap} label="FinAgent" active={empActivePage === "finagent"} onClick={() => setEmpActivePage("finagent")} />
                            <SidebarNavItem icon={ListOrdered} label="My Orders" active={empActivePage === "orders"} onClick={() => setEmpActivePage("orders")} />
                        </>
                    ) : portalMode === "hr" ? (
                        <>
                            <SidebarNavItem icon={Home} label="Overview" active={activePage === "hr-overview"} onClick={() => goToPage("hr-overview")} />
                            <SidebarNavItem icon={Users} label="Employees" active={activePage === "hr-employees"} onClick={() => goToPage("hr-employees")} />
                        </>
                    ) : isRM ? (
                        <>
                            <SidebarNavItem icon={BarChart2} label="Dashboard" active={activePage === "dashboard" && !showCorporateOnboarding} onClick={() => goToPage("dashboard")} />
                            <SidebarNavItem icon={Building2} label="Corporates" active={activePage === "corporates" && !showCorporateOnboarding} onClick={() => goToPage("corporates")} />
                            <SidebarNavItem icon={Plus} label="New Corporate" active={showCorporateOnboarding} onClick={handleAddNewCorporate} />
                            <SidebarNavItem icon={Users} label="Employees" active={activePage === "rm-employees"} onClick={() => goToPage("rm-employees")} />
                            <SidebarNavItem icon={Infinity} label="Integrations" active={activePage === "integrations"} onClick={() => goToPage("integrations")} />
                            <SidebarNavItem icon={Package} label="Products" active={activePage === "rm-products"} onClick={() => goToPage("rm-products")} />
                        </>
                    ) : (
                        <>
                            <SidebarNavItem icon={BarChart2} label="Dashboard" active={activePage === "dashboard"} onClick={() => goToPage("dashboard")} />
                            <SidebarNavItem icon={Rocket} label="Connections" active={activePage === "connections"} onClick={() => goToPage("connections")} />
                            <SidebarNavItem icon={PieChart} label="Reporting" active={activePage === "reporting"} onClick={() => goToPage("reporting")} />
                            <SidebarNavItem icon={Building2} label="Corporates" active={activePage === "corporates"} onClick={() => goToPage("corporates")} />
                            <SidebarNavItem icon={Infinity} label="Integrations" active={activePage === "integrations"} onClick={() => goToPage("integrations")} />
                            <SidebarNavItem icon={Database} label="Data Models" active={activePage === "data-models"} onClick={() => goToPage("data-models")} />
                            <SidebarNavItem icon={Webhook} label="Webhooks" active={activePage === "webhooks"} onClick={() => goToPage("webhooks")} />
                            <SidebarNavItem icon={Bug} label="Diagnostics" active={activePage === "diagnostics"} onClick={() => goToPage("diagnostics")} />
                        </>
                    )}
                    {portalMode !== "hr" && (
                        <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                            <SidebarNavItem icon={Settings} label="Settings" active={false} onClick={() => {}} showArrow />
                        </div>
                    )}
                </nav>
                <div className="px-4 py-4 border-t border-[#E5E7EB] space-y-2">
                    <button type="button" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#F9FAFB] transition-colors text-left">
                        <div className="relative">
                            <Bell className="w-5 h-5 text-[#6B7280]" />
                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">3</span>
                        </div>
                        <span className="text-sm font-medium text-[#374151]">Notifications</span>
                    </button>
                    {portalMode === "employee" ? (
                        <div className="space-y-1">
                            <label className="text-[11px] text-[#6B7280] block">Login as employee</label>
                            <select
                                value={selectedPortalEmployeeId ?? ""}
                                onChange={(e) => {
                                    const id = e.target.value || null;
                                    setSelectedPortalEmployeeId(id);
                                    try {
                                        if (id) localStorage.setItem(PORTAL_EMPLOYEE_ID_KEY, id);
                                        else localStorage.removeItem(PORTAL_EMPLOYEE_ID_KEY);
                                    } catch { /* ignore */ }
                                }}
                                className="w-full text-sm font-medium text-[#111827] bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dashboard-primary/20"
                            >
                                <option value="">Select employee</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name} ({emp.id})
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#F9FAFB]">
                        <div className="w-9 h-9 rounded-full bg-dashboard-primary flex items-center justify-center text-white text-xs font-bold">GS</div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[#111827] truncate">Rahul Sharma</p>
                            <p className="text-[11px] text-[#6B7280]">EMP12345</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                    </div>
                    )}
                    <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm text-[#6B7280] hover:text-[#111827] transition-colors">
                        <ExternalLink className="w-4 h-4" />
                        Documentation
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="h-14 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        {portalMode === "rm" && (
                            <div className="rounded-lg bg-[#F3F4F6] px-2 py-1">
                                <ProfileSwitcher />
                            </div>
                        )}
                        {portalMode !== "employee" && activePage === "corporates" && selectedCorporate && (
                            <span className="text-sm text-[#6B7280]">{selectedCorporate} / Employees</span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button type="button" className="p-2 rounded-lg hover:bg-[#F9FAFB] text-[#6B7280] relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1">4</span>
                        </button>
                        <div className="flex items-center gap-2 pl-3 border-l border-[#E5E7EB]">
                            <div className="w-8 h-8 rounded-full bg-dashboard-primary flex items-center justify-center text-white text-xs font-bold">GS</div>
                            <span className="text-sm font-medium text-[#374151]">Rahul Sharma</span>
                            <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden px-8 py-8 bg-[#FAFBFC]">
                    {portalMode === "employee" ? (
                        <EmployeePortalContent
                        activePage={empActivePage}
                        onNavigate={setEmpActivePage}
                        currentEmployeeId={selectedPortalEmployeeId}
                        currentEmployee={selectedPortalEmployeeId ? employees.find((e) => e.id === selectedPortalEmployeeId) ?? null : null}
                        onResumeFromNudge={handleResumeFromNudge}
                    />
                    ) : showCorporateOnboarding ? (
                        <CorporateOnboarding
                            onComplete={handleCorporateOnboardingComplete}
                            onCancel={() => setShowCorporateOnboarding(false)}
                        />
                    ) : selectedEmployee && portalMode === "hr" ? (
                        <HREmployeeDetail
                            employee={selectedEmployee}
                            journeyStatus={employeeStatuses[selectedEmployee.id] || null}
                            onBack={() => setSelectedEmployee(null)}
                        />
                    ) : (
                        <DashboardPageContent
                            activePage={activePage}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            selectedCorporate={selectedCorporate}
                            setSelectedCorporate={setSelectedCorporate}
                            employees={portalMode === "hr" ? employees.filter((e) => (e.companyName || "Chola Business Services") === HR_OWN_CORPORATE) : employees}
                            employeeStatuses={employeeStatuses}
                            invitedEmployeeIds={invitedEmployeeIds}
                            filterEmployees={filterEmployees}
                            refreshStatuses={refreshStatuses}
                            handleInvite={handleInvite}
                            handleRefreshInvites={handleRefreshInvites}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            directoryPage={directoryPage}
                            setDirectoryPage={setDirectoryPage}
                            accountOpenedPage={accountOpenedPage}
                            setAccountOpenedPage={setAccountOpenedPage}
                            setSelectedEmployee={setSelectedEmployee}
                            corporates={portalMode === "hr" ? [HR_OWN_CORPORATE] as const : CORPORATES}
                            corporatesTableData={corporatesTableData}
                            connections={portalMode === "hr" ? ALL_CONNECTIONS.filter((c) => c.corporate === HR_OWN_CORPORATE) : ALL_CONNECTIONS}
                            hrmsIntegrations={HRMS_INTEGRATIONS}
                            diagnostics={ALL_DIAGNOSTICS}
                            portalMode={portalMode}
                            onAddNewCorporate={handleAddNewCorporate}
                            onNavigate={goToPage}
                            onHrSyncNow={handleHrSyncNow}
                            lastHrSyncAt={lastHrSyncAt}
                            onRetriggerJourney={handleRetriggerJourney}
                            onNudge={handleNudge}
                            nudgeFeedback={nudgeFeedback}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── HR Employee Detail (matches screenshot layout) ───────────────────────

function HREmployeeDetail({ employee, journeyStatus, onBack }: { employee: Employee; journeyStatus: JourneyStatus | null; onBack: () => void }) {
    const name = journeyStatus?.name || employee.name || "Employee";
    const email = journeyStatus?.email || employee.email || "—";
    const phone = journeyStatus?.phone || employee.phone || "—";
    const income = journeyStatus?.income || employee.income;
    const initials = (name || "").split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
    const salaryL = income ? `₹${(parseInt(String(income), 10) / 100000).toFixed(1)}L` : "—";
    const tenure = employee.dateOfJoining ? "8.5y" : "—";
    const finScore = 81;
    const totalDisbursed = journeyStatus?.status === "completed" ? "₹16.2L" : "—";
    const activeProducts = journeyStatus?.status === "completed" ? 3 : 0;
    const lastLogin = "18/2/2026";
    const products = journeyStatus?.status === "completed" ? ["Mahindra Finance Personal Loan", "Mahindra Finance Home Loan"] : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="flex items-center gap-2 text-sm text-dashboard-primary font-medium hover:underline">
                    <ArrowLeft className="w-4 h-4" /> Back to Employees
                </button>
                <div className="flex gap-3">
                    <button className="h-9 px-4 bg-dashboard-primary text-white text-sm font-medium rounded-lg">Edit Employee</button>
                    <button className="h-9 px-4 bg-red-600 text-white text-sm font-medium rounded-lg">Deactivate</button>
                </div>
            </div>
            <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-[#7C3AED] flex items-center justify-center text-white text-2xl font-bold">{initials}</div>
                <div>
                    <h1 className="text-2xl font-bold text-[#111827]">{name}</h1>
                    <p className="text-sm text-[#6B7280]">{employee.id} • {employee.department || "—"}</p>
                    <span className={cn("inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold", journeyStatus?.status === "completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200")}>
                        {journeyStatus?.status === "completed" ? "Active Employee • Journey Completed" : "Active Employee"}
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-4">Basic Information</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-[#6B7280]">Email</span><span className="text-[#111827]">{email}</span></div>
                        <div className="flex justify-between"><span className="text-[#6B7280]">Phone</span><span className="text-[#111827]">{phone}</span></div>
                        <div className="flex justify-between"><span className="text-[#6B7280]">Department</span><span className="text-[#111827]">{employee.department}</span></div>
                        <div className="flex justify-between"><span className="text-[#6B7280]">Location</span><span className="text-[#111827]">{employee.jobLocationCity || "Chennai"}</span></div>
                        <div className="flex justify-between"><span className="text-[#6B7280]">Joining Date</span><span className="text-[#111827]">{employee.dateOfJoining || "23 January 2017"}</span></div>
                        <div className="flex justify-between"><span className="text-[#6B7280]">Tenure</span><span className="text-[#111827]">{tenure}</span></div>
                        <div className="flex justify-between"><span className="text-[#6B7280]">Reporting Manager</span><span className="text-[#111827]">Kiran Kumar</span></div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-4">Financial Information</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-[#6B7280]">Annual Salary</span><span className="text-[#111827]">{salaryL}</span></div>
                            <div className="flex justify-between items-center"><span className="text-[#6B7280]">Financial Score</span><span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">{finScore}</span></div>
                            <div className="flex justify-between"><span className="text-[#6B7280]">Total Disbursed</span><span className="text-[#111827]">{journeyStatus?.status === "completed" ? totalDisbursed : "—"}</span></div>
                        </div>
                    </div>
                    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-4">Quick Stats</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[#6B7280]">Financial Score</span>
                                <span className="text-sm font-semibold text-[#111827]">{finScore}</span>
                            </div>
                            <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden"><div className="h-full w-[81%] bg-emerald-500 rounded-full" /></div>
                            <div className="flex justify-between text-sm"><span className="text-[#6B7280]">Active Products</span><span className="text-[#111827]">{activeProducts}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-[#6B7280]">Total Disbursed</span><span className="text-[#111827]">{totalDisbursed}</span></div>
                        </div>
                    </div>
                    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-4">Activity</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-[#6B7280]">Last Login</span><span className="text-[#111827]">{lastLogin}</span></div>
                            <div className="flex justify-between"><span className="text-[#6B7280]">Tenure</span><span className="text-[#111827]">{tenure}</span></div>
                        </div>
                        <button className="mt-4 h-9 px-4 bg-dashboard-primary text-white text-sm font-medium rounded-lg">Send Message</button>
                    </div>
                </div>
            </div>
            {journeyStatus?.status === "completed" && (
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-4">Active Products ({activeProducts})</h2>
                    <div className="flex flex-wrap gap-2">
                        {products.map((p) => (
                            <span key={p} className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">Active — {p}</span>
                        ))}
                    </div>
                </div>
            )}
            {(() => {
                const empIfsc = journeyStatus?.status === "completed" ? journeyStatus.ifscCode : employee.bankIfscCode;
                const empBankName = (journeyStatus?.status === "completed" ? journeyStatus.bankName : undefined) || employee.bankName || getBankNameFromIfsc(empIfsc);
                const empAccount = journeyStatus?.status === "completed" ? journeyStatus.accountNumber : employee.bankAccountNumber;
                const showBank = empBankName || empAccount || empIfsc;
                if (!showBank) return null;
                return (
                    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-4">Bank Details</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-[#6B7280]">Bank Name</span><span className={empBankName ? "text-[#111827]" : "text-[#9CA3AF]"}>{empBankName || "NOT AVAILABLE"}</span></div>
                            <div className="flex justify-between"><span className="text-[#6B7280]">Account Number</span><span className="text-[#111827] font-mono">{empAccount ? maskAccountNumber(empAccount) : "NOT AVAILABLE"}</span></div>
                            <div className="flex justify-between"><span className="text-[#6B7280]">IFSC Code</span><span className="text-[#111827] font-mono">{empIfsc || "NOT AVAILABLE"}</span></div>
                        </div>
                    </div>
                );
            })()}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-4">Emergency Details</h2>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-[#6B7280]">Emergency Contact</span><span className="text-[#111827]">+91456338935</span></div>
                    <div className="flex justify-between"><span className="text-[#6B7280]">Blood Group</span><span className="text-[#111827]">AB-</span></div>
                </div>
            </div>
        </div>
    );
}

// ─── Employee Profile Component ─────────────────────────────────────────

function EmployeeProfile({
    employee,
    journeyStatus,
    onBack,
}: {
    employee: Employee;
    journeyStatus: JourneyStatus | null;
    onBack: () => void;
}) {
    if (!employee) return null;
    const na = "NOT AVAILABLE";
    const val = (v: string | undefined | null) => (v && String(v).trim() ? String(v) : na);

    // Bank details: prefer employee (HRMS) data, then journey; derive bank name from IFSC if missing
    const rawBankName = journeyStatus?.status === "completed" ? journeyStatus.bankName : undefined;
    const rawAccount = journeyStatus?.status === "completed" ? journeyStatus.accountNumber : undefined;
    const rawIfsc = journeyStatus?.status === "completed" ? journeyStatus.ifscCode : undefined;
    const bankName = val(
        rawBankName || employee.bankName || getBankNameFromIfsc(rawIfsc || employee.bankIfscCode)
    );
    const accountNumber = (rawAccount || employee.bankAccountNumber)
        ? maskAccountNumber(rawAccount || employee.bankAccountNumber)
        : na;
    const ifscCode = val(rawIfsc || employee.bankIfscCode);

    // Merge journey updates over static employee data (with defensive fallbacks)
    const name = journeyStatus?.name || employee.name || "Employee";
    const email = journeyStatus?.email || employee.email || na;
    const phone = journeyStatus?.phone || employee.phone || na;
    const dob = journeyStatus?.dob || employee.dob;
    const currentAddress = journeyStatus?.currentAddress || employee.currentAddress;
    const fatherName = journeyStatus?.fatherName || employee.fatherName;
    const motherName = journeyStatus?.motherName || employee.motherName;
    const income = journeyStatus?.income || employee.income;

    return (
        <div className="flex h-screen w-full bg-[#FAFBFC] text-[#374151] font-manrope overflow-hidden" style={{ minHeight: 0 }}>
            {/* Sidebar - matching main dashboard */}
            <aside className="w-56 bg-white border-r border-[#E5E7EB] flex flex-col flex-shrink-0 shadow-sm">
                <div className="px-4 py-5 flex items-center gap-2 border-b border-[#E5E7EB]">
                    <LayoutGrid className="w-5 h-5 text-dashboard-primary" />
                    <span className="font-semibold text-[#111827]">After Deploy</span>
                </div>
                <nav className="flex-1 py-4 px-2">
                    <SidebarNavItem icon={Users} label="Employee Profile" active onClick={() => {}} />
                    <SidebarNavItem icon={LayoutGrid} label="Back to Directory" active={false} onClick={onBack} />
                    <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                        <SidebarNavItem icon={Settings} label="Settings" active={false} onClick={() => {}} />
                    </div>
                </nav>
                <div className="px-4 py-4 border-t border-[#E5E7EB]">
                    <a href="#" className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#111827] transition-colors">
                        <ExternalLink className="w-4 h-4" />
                        Documentation
                    </a>
                </div>
            </aside>

            {/* Main Content area */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <header className="h-14 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <ProfileSwitcher />
                        <span className="text-sm text-[#6B7280] border-l border-[#E5E7EB] pl-4">
                            {employee.companyName || "Chola Business Services"} / {name}
                        </span>
                    </div>
                </header>
                {/* Scrollable content */}
                <main className="flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden px-6 py-6" style={{ WebkitOverflowScrolling: "touch" }}>
                {/* Breadcrumbs */}
                <div className="flex items-center gap-3 text-sm text-[#6B7280] mb-6">
                    <span>Active Connections</span>
                    <span className="text-[#9CA3AF]">/</span>
                    <span>Chola Business Services</span>
                    <span className="text-[#9CA3AF]">/</span>
                    <span className="text-dashboard-primary font-medium">{name}</span>
                </div>

                {/* Back button */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm text-dashboard-primary font-medium mb-6 hover:underline cursor-pointer w-fit"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Employee Directory
                </button>

                {/* Employee Header Card */}
                <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-6 mb-6 flex items-center gap-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                        {(name || "").split(" ").filter(Boolean).map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-[#111827]">{name}</h1>
                        <p className="text-sm text-[#6B7280] mt-0.5">{employee.designation} &middot; {employee.department}</p>
                    </div>
                    {journeyStatus && (
                        <div className="flex items-center gap-2">
                            {journeyStatus.status === "completed" ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Journey Completed
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-dashboard-primary-light text-dashboard-primary border border-dashboard-primary/30">
                                    <Clock className="w-3.5 h-3.5" />
                                    In Progress: {journeyStatus.currentStepTitle}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Employee Details Section */}
                <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm mb-6 overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
                        <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wide flex items-center gap-2">
                            <User className="w-4 h-4 text-dashboard-primary" />
                            Employee details
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-12">
                            <ProfileField label="Name" value={val(name)} />
                            <ProfileField label="Work Email" value={val(email)} />
                            <ProfileField label="Date Of Joining" value={val(employee.dateOfJoining)} />
                            <ProfileField label="Employment Status" value={val(employee.employmentStatus)} />
                            <ProfileField label="Employment Type" value={val(employee.employmentType)} />
                            <ProfileField label="Gender" value={val(employee.gender)} />
                            <ProfileField label="Employee ID" value={val(employee.id)} />
                            <ProfileField label="Date Of Birth" value={val(dob)} />
                            <ProfileField label="Designation" value={val(employee.designation)} />
                            <ProfileField label="Department" value={val(employee.department)} />
                            <ProfileField label="Mobile Number" value={val(phone)} />
                            <ProfileField label="Grade" value={val(employee.grade)} />
                            <ProfileField label="Group" value={val(employee.group)} />
                            <ProfileField label="Cost Center" value={val(employee.costCenter)} />
                            <ProfileField label="Father's Name" value={val(fatherName)} />
                            <ProfileField label="Mother's Name" value={val(motherName)} />
                            <ProfileField label="Manager Email Level 1" value={na} />
                            <ProfileField label="Manager Email Level 2" value={na} />
                            <ProfileField label="Manager Email Level 3" value={na} />
                            <ProfileField label="Manager Email Level 4" value={na} />
                            <ProfileField label="Manager Email Level 5" value={na} />
                            <ProfileField label="Company Name" value={val(employee.companyName)} />
                            <ProfileField label="CountryCode" value={val(employee.countryCode)} />
                            <ProfileField label="Current Address" value={val(currentAddress)} />
                            <ProfileField label="Annual Salary" value={income ? `₹${(parseInt(String(income), 10) / 100000).toFixed(1)}L` : na} />
                            <ProfileField label="Permanent Address" value={val(employee.permanentAddress)} />
                            <ProfileField label="Job Location City" value={val(employee.jobLocationCity)} />
                            <ProfileField label="Job Location Pincode" value={val(employee.jobLocationPincode)} />
                            <ProfileField label="Marriage Date" value={val(employee.marriageDate)} />
                        </div>
                    </div>
                </div>

                {/* Bank Details Section */}
                <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm mb-8 overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
                        <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wide flex items-center gap-2">
                            <svg className="w-4 h-4 text-dashboard-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Bank details
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-12">
                            <ProfileField label="Bank Name" value={bankName} />
                            <ProfileField label="Account Number" value={accountNumber} />
                            <ProfileField label="IFSC Code" value={ifscCode} />
                        </div>
                    </div>
                </div>
                </main>
            </div>
        </div>
    );
}

// ─── Sub-Components ─────────────────────────────────────────────────────

function SidebarNavItem({
    icon: Icon,
    label,
    active,
    onClick,
    showArrow,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    active: boolean;
    onClick: () => void;
    showArrow?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all mb-1",
                active
                    ? "bg-[#E6F2FF] text-[#0066CC] shadow-sm"
                    : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
            )}
        >
            <div className="flex items-center gap-3 min-w-0">
                <Icon className={cn("w-5 h-5 shrink-0", active ? "text-[#0066CC]" : "text-[#9CA3AF]")} />
                {label}
            </div>
            {showArrow && <ChevronRight className="w-4 h-4 shrink-0 text-[#9CA3AF]" />}
        </button>
    );
}

function StatCard({
    label,
    value,
    icon,
    color,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: "blue" | "yellow" | "red" | "green";
}) {
    const colorMap = {
        blue: "text-dashboard-primary",
        yellow: "text-[#D97706]",
        red: "text-[#DC2626]",
        green: "text-emerald-600",
    };
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#6B7280]">{label}</span>
                <div className={colorMap[color]}>{icon}</div>
            </div>
            <div className={cn("text-2xl font-bold mt-2", colorMap[color])}>{value}</div>
        </div>
    );
}

function ProfileField({ label, value }: { label: string; value: string }) {
    const isNA = value === "NOT AVAILABLE";
    return (
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
            <span className="text-xs font-medium text-[#6B7280] min-w-[180px] shrink-0">{label}</span>
            <span className={cn("text-sm font-medium", isNA ? "text-[#9CA3AF]" : "text-[#111827]")}>
                {value}
            </span>
        </div>
    );
}

function HeaderCell({ label, hasFilter, className }: { label: string; hasFilter?: boolean; className?: string }) {
    return (
        <th className={cn("px-5 py-4 text-left font-semibold text-[#374151] whitespace-nowrap text-xs uppercase tracking-wide", className)}>
            <div className="flex items-center gap-2">
                {label}
                {hasFilter && <Filter className="w-3.5 h-3.5" />}
            </div>
        </th>
    );
}
