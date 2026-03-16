"use client";

import React from "react";
import {
    Link2,
    PieChart,
    Building2,
    Webhook,
    Search,
    Download,
    Filter,
    RefreshCcw,
    ArrowLeft,
    CheckCircle2,
    Check,
    Clock,
    X,
    Users,
    XCircle,
    Rocket,
    Infinity,
    Plus,
    Send,
    Pencil,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronsUpDown,
    Package,
    HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DATA_MODELS_RESPONSE } from "@/lib/dataModelsConfig";
import {
    StatCard,
    HeaderCell,
    getJourneyCategory,
    getStatusBadge,
} from "./DashboardShared";
import ProductMarketplaceDashboard from "./shared/ProductMarketplaceDashboard";

const ITEMS_PER_PAGE = 10;
const CONNECTIONS_PER_PAGE = 10;

type DataModelField = { display_name: string; is_checked?: boolean };
type DataModelCategory = Record<string, DataModelField>;
type DataModelsData = Record<string, DataModelCategory>;

export type PageKey = "dashboard" | "connections" | "reporting" | "corporates" | "integrations" | "data-models" | "webhooks" | "diagnostics" | "rm-employees" | "rm-products" | "rm-analytics" | "hr-overview" | "hr-employees";
export type TabKey = "directory" | "accountOpened";

// Minimal interface - accepts any Employee-like object
export interface Employee {
    id: string;
    name: string;
    phone: string;
    email: string;
    journey: string;
    companyName?: string;
}

export interface JourneyStatus {
    status?: "in_progress" | "completed";
    currentStepTitle?: string;
}

export interface DashboardPageContentProps<TEmployee extends Employee = Employee, TStatus extends JourneyStatus = JourneyStatus> {
    activePage: PageKey;
    activeTab: TabKey;
    setActiveTab: (t: TabKey) => void;
    selectedCorporate: string | null;
    setSelectedCorporate: (c: string | null) => void;
    employees: TEmployee[];
    employeeStatuses: Record<string, TStatus>;
    invitedEmployeeIds: Record<string, boolean>;
    filterEmployees: (list: TEmployee[]) => TEmployee[];
    refreshStatuses: () => void;
    handleInvite: (emp: TEmployee) => void;
    handleRefreshInvites: () => void;
    searchQuery: string;
    setSearchQuery: (s: string) => void;
    directoryPage: number;
    setDirectoryPage: (n: number) => void;
    accountOpenedPage: number;
    setAccountOpenedPage: (n: number) => void;
    setSelectedEmployee: (e: TEmployee | null) => void;
    corporates: readonly string[];
    corporatesTableData: Array<{ corporateName: string; categories: string; connections: string; status: string; contactName: string; dateAdded: string; corpCategory?: string; kybStatus?: string }>;
    connections: Array<{ id: string; corporate: string; dateOfConnection: string; integration: string; csm: string; lastSynced: string; syncFreq: string; status: string; stepsStatus: string }>;
    hrmsIntegrations: Array<{ name: string; status: string }>;
    diagnostics: Array<{ corporate: string; connectionType: string; dataPosting: string; dataReceiving: string; authStatus: string }>;
    portalMode?: "hr" | "rm" | "employee";
    onAddNewCorporate?: () => void;
    onNavigate?: (page: PageKey) => void;
}

export function DashboardPageContent<TEmployee extends Employee = Employee, TStatus extends JourneyStatus = JourneyStatus>(props: DashboardPageContentProps<TEmployee, TStatus>) {
    const {
        activePage,
        activeTab,
        setActiveTab,
        selectedCorporate,
        setSelectedCorporate,
        employees,
        employeeStatuses,
        invitedEmployeeIds,
        filterEmployees,
        refreshStatuses,
        handleInvite,
        handleRefreshInvites,
        searchQuery,
        setSearchQuery,
        directoryPage,
        setDirectoryPage,
        accountOpenedPage,
        setAccountOpenedPage,
        setSelectedEmployee,
        corporates,
        corporatesTableData,
        connections,
        hrmsIntegrations,
        diagnostics,
        portalMode = "hr",
        onAddNewCorporate,
        onNavigate,
    } = props;

    const [connectionsPage, setConnectionsPage] = React.useState(1);
    const connectionsTotalPages = Math.ceil(connections.length / CONNECTIONS_PER_PAGE);
    const paginatedConnections = connections.slice((connectionsPage - 1) * CONNECTIONS_PER_PAGE, connectionsPage * CONNECTIONS_PER_PAGE);

    const [corporatesSearch, setCorporatesSearch] = React.useState("");
    const [corporatesPage, setCorporatesPage] = React.useState(1);
    const filteredCorporates = corporatesSearch.trim()
        ? corporatesTableData.filter((c) => c.corporateName.toLowerCase().includes(corporatesSearch.toLowerCase()))
        : corporatesTableData;
    const corporatesTotalPages = Math.max(1, Math.ceil(filteredCorporates.length / 10));
    const paginatedCorporates = filteredCorporates.slice((corporatesPage - 1) * 10, corporatesPage * 10);

    const [diagPage, setDiagPage] = React.useState(1);
    const diagPerPage = 10;
    const diagTotalPages = Math.ceil(diagnostics.length / diagPerPage);
    const paginatedDiag = diagnostics.slice((diagPage - 1) * diagPerPage, diagPage * diagPerPage);

    const [dataModelState, setDataModelState] = React.useState(() => {
        type FieldDef = { display_name: string; is_checked?: boolean };
        type InnerMap = Record<string, FieldDef>;
        type DataModels = { data: Record<string, InnerMap> };
        const d = (DATA_MODELS_RESPONSE as unknown as DataModels).data;
        const state: Record<string, Record<string, boolean>> = {};
        for (const [cat, fields] of Object.entries(d)) {
            if (cat === "configuration" || typeof fields !== "object") continue;
            state[cat] = {};
            for (const [key, val] of Object.entries(fields)) {
                if (val && typeof val === "object" && "is_checked" in val) {
                    (state[cat] as Record<string, boolean>)[key] = (val as { is_checked?: boolean }).is_checked ?? false;
                }
            }
        }
        return state;
    });
    const dataModelsData: DataModelsData = (DATA_MODELS_RESPONSE as unknown as { data: DataModelsData }).data;

    const [webhookEndpoint, setWebhookEndpoint] = React.useState("play.svix.com/in/e_FiJHkybMzmuaaieoRZ07aQ3CAod/");
    const [webhookEvents, setWebhookEvents] = React.useState<Record<string, boolean>>({ "Sync process started": true, "New employee added": true });
    const [hrDeptFilter, setHrDeptFilter] = React.useState("All Departments");
    const [hrStatusFilter, setHrStatusFilter] = React.useState("All Status");
    const [hrScoreFilter, setHrScoreFilter] = React.useState("All Scores");
    const [hrSearch, setHrSearch] = React.useState("");
    const [corporateServicesDropdownOpen, setCorporateServicesDropdownOpen] = React.useState(false);
    const [corporateBenefitToggles, setCorporateBenefitToggles] = React.useState<Record<string, Record<number, boolean>>>(() => {
        if (typeof window === "undefined") return {};
        try {
            const raw = localStorage.getItem("hdfc_corporate_benefit_toggles");
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    });

    // HR Manage employees: tabs, shared state, selection, modals
    const [hrEmployeesMainTab, setHrEmployeesMainTab] = React.useState<"directory" | "updates" | "manage">("directory");
    const [manageSubTab, setManageSubTab] = React.useState<"shared" | "unshared">("unshared");
    const [sharedEmployeeIds, setSharedEmployeeIds] = React.useState<Record<string, boolean>>(() => {
        if (typeof window === "undefined") return {};
        try {
            const raw = localStorage.getItem("hdfc_hr_shared_employee_ids");
            return raw ? JSON.parse(raw) : {};
        } catch { return {}; }
    });
    const [selectedForShare, setSelectedForShare] = React.useState<Record<string, boolean>>({});
    const [showColumnFilterModal, setShowColumnFilterModal] = React.useState(false);
    const [showShareConfirmModal, setShowShareConfirmModal] = React.useState(false);
    const [visibleOptionalColumns, setVisibleOptionalColumns] = React.useState<string[]>([]);
    const [manageSearchQuery, setManageSearchQuery] = React.useState("");
    const [managePage, setManagePage] = React.useState(1);
    const [columnFilterSearch, setColumnFilterSearch] = React.useState("");
    const [hrmsSearch, setHrmsSearch] = React.useState("");
    const [showHrmsRequestModal, setShowHrmsRequestModal] = React.useState(false);
    const [hrmsRequestName, setHrmsRequestName] = React.useState("");
    const [hrmsRequestUrl, setHrmsRequestUrl] = React.useState("");
    const [hrmsRequestMessage, setHrmsRequestMessage] = React.useState("");
    const [rmTenureFilter, setRmTenureFilter] = React.useState<string>("");
    const [rmAgeFilter, setRmAgeFilter] = React.useState<string>("");
    const [rmGradeFilter, setRmGradeFilter] = React.useState<string>("");
    const [rmIncomeFilter, setRmIncomeFilter] = React.useState<string>("");
    const [rmDeptFilter, setRmDeptFilter] = React.useState<string>("");

    const applyRmFilters = React.useCallback((list: TEmployee[]) => {
        let out = list;
        if (rmTenureFilter) {
            const now = new Date();
            out = out.filter((e) => {
                const doj = (e as Record<string, unknown>).dateOfJoining as string | undefined;
                if (!doj) return true;
                const [y, m] = doj.split("-").map(Number);
                const months = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
                if (rmTenureFilter === "<12") return months < 12;
                if (rmTenureFilter === "12-24") return months >= 12 && months <= 24;
                if (rmTenureFilter === ">24") return months > 24;
                return true;
            });
        }
        if (rmAgeFilter) {
            out = out.filter((e) => {
                const dob = (e as Record<string, unknown>).dob as string | undefined;
                if (!dob) return true;
                const birthYear = parseInt(dob.slice(0, 4), 10);
                const age = new Date().getFullYear() - birthYear;
                if (rmAgeFilter === "25-35") return age >= 25 && age <= 35;
                if (rmAgeFilter === "35-45") return age >= 35 && age <= 45;
                if (rmAgeFilter === ">45") return age > 45;
                return true;
            });
        }
        if (rmGradeFilter) out = out.filter((e) => ((e as Record<string, unknown>).grade as string) === rmGradeFilter || !(e as Record<string, unknown>).grade);
        if (rmIncomeFilter) out = out.filter((e) => ((e as Record<string, unknown>).income as string) === rmIncomeFilter || !(e as Record<string, unknown>).income);
        if (rmDeptFilter) out = out.filter((e) => ((e as Record<string, unknown>).department as string) === rmDeptFilter || !(e as Record<string, unknown>).department);
        return out;
    }, [rmTenureFilter, rmAgeFilter, rmGradeFilter, rmIncomeFilter, rmDeptFilter]);

    const allFiltered = filterEmployees(employees);
    const completedEmployees = filterEmployees(employees.filter((e) => employeeStatuses[e.id]?.status === "completed"));
    const corpEmployees = selectedCorporate ? filterEmployees(employees.filter((e) => (e.companyName || "Chola Business Services") === selectedCorporate)) : [];
    const corpCompleted = selectedCorporate ? filterEmployees(employees.filter((e) => (e.companyName || "Chola Business Services") === selectedCorporate && employeeStatuses[e.id]?.status === "completed")) : [];
    const baseList = activeTab === "accountOpened" ? (selectedCorporate ? corpCompleted : completedEmployees) : (selectedCorporate ? corpEmployees : allFiltered);
    const currentList = portalMode === "rm" && (rmTenureFilter || rmAgeFilter || rmGradeFilter || rmIncomeFilter || rmDeptFilter) ? applyRmFilters(baseList) : baseList;
    const currentPage = activeTab === "accountOpened" ? accountOpenedPage : directoryPage;
    const setCurrentPage = activeTab === "accountOpened" ? setAccountOpenedPage : setDirectoryPage;
    const totalPages = Math.max(1, Math.ceil(currentList.length / ITEMS_PER_PAGE));
    const paginatedList = currentList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    React.useEffect(() => {
        try {
            localStorage.setItem("hdfc_hr_shared_employee_ids", JSON.stringify(sharedEmployeeIds));
        } catch {
            // ignore
        }
    }, [sharedEmployeeIds]);

    React.useEffect(() => {
        try {
            localStorage.setItem("hdfc_corporate_benefit_toggles", JSON.stringify(corporateBenefitToggles));
        } catch {
            // ignore
        }
    }, [corporateBenefitToggles]);

    // ─── HR Portal Overview: exact replica of Employee Portal dashboard (for upsell/cross-sell) ──
    if (activePage === "hr-overview") {
        return (
            <ProductMarketplaceDashboard
                showHero
                userName="Rahul"
            />
        );
    }

    if (activePage === "hr-employees") {
        const hrEmployees = employees;
        const getFinScore = (emp: Employee) => (emp.id.charCodeAt(0) + emp.id.charCodeAt(1)) % 40 + 55;
        const getProducts = (emp: Employee) => (emp.id.length % 5) + 1;
        const getSalary = (emp: Employee) => {
            const inc = (emp as { income?: string }).income;
            return inc ? `₹${(parseInt(inc, 10) / 100000).toFixed(1)}L` : "—";
        };
        const getTenure = () => "8.5y";
        const getCorporateAccountStatus = (empId: string) => {
            const status = employeeStatuses[empId]?.status;
            const invited = !!invitedEmployeeIds[empId];
            if (status === "completed") return { label: "Opened", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" };
            if (status === "in_progress" || invited) return { label: "In Process", className: "bg-amber-50 text-amber-700 border border-amber-200" };
            return { label: "Not Started", className: "bg-slate-50 text-slate-600 border border-slate-200" };
        };
        const filteredHr = hrSearch.trim()
            ? hrEmployees.filter((e) => {
                const displayName = (employeeStatuses[e.id] as { name?: string })?.name || e.name || "";
                return displayName.toLowerCase().includes(hrSearch.toLowerCase()) || e.id.toLowerCase().includes(hrSearch.toLowerCase()) || ((e as { department?: string }).department || "").toLowerCase().includes(hrSearch.toLowerCase());
            })
            : hrEmployees;

        // Manage employees: shared vs unshared lists
        const sharedList = hrEmployees.filter((e) => sharedEmployeeIds[e.id]);
        const unsharedList = hrEmployees.filter((e) => !sharedEmployeeIds[e.id]);
        const manageList = manageSubTab === "shared" ? sharedList : unsharedList;
        const manageFiltered = manageSearchQuery.trim()
            ? manageList.filter((e) => (e.name || "").toLowerCase().includes(manageSearchQuery.toLowerCase()) || e.id.toLowerCase().includes(manageSearchQuery.toLowerCase()) || (e.email || "").toLowerCase().includes(manageSearchQuery.toLowerCase()))
            : manageList;
        const manageTotalPages = Math.max(1, Math.ceil(manageFiltered.length / ITEMS_PER_PAGE));
        const managePaginated = manageFiltered.slice((managePage - 1) * ITEMS_PER_PAGE, managePage * ITEMS_PER_PAGE);
        const selectedCount = Object.keys(selectedForShare).filter((id) => selectedForShare[id]).length;

        const optionalColumnDefs = [
            { key: "employmentStatus", label: "Employment Status" },
            { key: "gender", label: "Gender" },
            { key: "department", label: "Department" },
            { key: "employmentType", label: "Employment Type" },
            { key: "grossPay", label: "Gross Pay" },
            { key: "groupName", label: "Group Name" },
            { key: "designation", label: "Designation" },
            { key: "grade", label: "Grade" },
            { key: "costCenter", label: "Cost Center" },
            { key: "nationality", label: "Nationality" },
        ];
        const filteredColumnDefs = columnFilterSearch.trim()
            ? optionalColumnDefs.filter((c) => c.label.toLowerCase().includes(columnFilterSearch.toLowerCase()))
            : optionalColumnDefs;

        const getEmpOptionalValue = (emp: TEmployee, key: string) => {
            const e = emp as Record<string, unknown>;
            if (key === "grossPay") return e.income != null && e.income ? `₹${(Number(e.income) / 100000).toFixed(1)}L` : "N/A";
            if (key === "groupName") return e.group != null && String(e.group).trim() ? String(e.group) : "N/A";
            const v = e[key];
            return v != null && String(v).trim() ? String(v) : "N/A";
        };

        return (
            <>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-[#111827]">HR Portal</h1>
                        <p className="text-sm text-[#6B7280] mt-0.5">Manage employee benefits and financial products</p>
                    </div>
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> HRMS Connected
                    </span>
                </div>

                {/* Main tabs: Employee Directory | Updates | Manage employees */}
                <div className="flex gap-6 border-b border-[#E5E7EB] mb-4">
                    <button
                        type="button"
                        onClick={() => setHrEmployeesMainTab("directory")}
                        className={cn("pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors", hrEmployeesMainTab === "directory" ? "border-dashboard-primary text-dashboard-primary" : "border-transparent text-[#6B7280] hover:text-[#111827]")}
                    >
                        Employee Directory <span className="ml-2 text-xs font-normal text-[#9CA3AF]">({hrEmployees.length})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setHrEmployeesMainTab("updates")}
                        className={cn("pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors", hrEmployeesMainTab === "updates" ? "border-dashboard-primary text-dashboard-primary" : "border-transparent text-[#6B7280] hover:text-[#111827]")}
                    >
                        Updates <span className="ml-2 text-xs font-normal text-[#9CA3AF]">(0)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setHrEmployeesMainTab("manage")}
                        className={cn("pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors", hrEmployeesMainTab === "manage" ? "border-dashboard-primary text-dashboard-primary" : "border-transparent text-[#6B7280] hover:text-[#111827]")}
                    >
                        Manage employees
                    </button>
                </div>

                {hrEmployeesMainTab === "directory" && (
                    <>
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <div className="flex-1 flex items-center bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 h-10">
                                <Search className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                                <input type="text" placeholder="Search employees by name, ID, or department..." value={hrSearch} onChange={(e) => setHrSearch(e.target.value)} className="ml-2 text-sm outline-none w-full bg-transparent" />
                            </div>
                            <button type="button" onClick={refreshStatuses} className="h-10 px-4 border border-[#E5E7EB] bg-white text-[#374151] font-medium text-sm rounded-lg flex items-center gap-2 shrink-0 hover:bg-[#F9FAFB]"><RefreshCcw className="w-4 h-4" /> Sync HRMS</button>
                        </div>
                        <div className="flex flex-wrap gap-3 mb-4">
                            <select value={hrDeptFilter} onChange={(e) => setHrDeptFilter(e.target.value)} className="h-10 px-4 border border-[#E5E7EB] rounded-lg text-sm bg-white text-[#374151]">
                                <option>All Departments</option>
                            </select>
                            <select value={hrStatusFilter} onChange={(e) => setHrStatusFilter(e.target.value)} className="h-10 px-4 border border-[#E5E7EB] rounded-lg text-sm bg-white text-[#374151]">
                                <option>All Status</option>
                            </select>
                            <select value={hrScoreFilter} onChange={(e) => setHrScoreFilter(e.target.value)} className="h-10 px-4 border border-[#E5E7EB] rounded-lg text-sm bg-white text-[#374151]">
                                <option>All Scores</option>
                            </select>
                        </div>
                        <p className="text-sm text-[#9CA3AF] mb-3">Last synced: 24/2/2026, 11:09:39 am</p>
                        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse min-w-[900px]">
                                    <thead className="bg-[#F9FAFB]"><tr className="border-b border-[#E5E7EB]">
                                        <HeaderCell label="Employee" /><HeaderCell label="Department" /><HeaderCell label="Salary" /><HeaderCell label="Tenure" /><HeaderCell label="Fin. Score" /><HeaderCell label="Products" /><HeaderCell label="Corporate Account" /><th className="px-5 py-4">Actions</th>
                                    </tr></thead>
                                    <tbody className="divide-y divide-[#E5E7EB]">
                                        {filteredHr.map((emp) => {
                                            const score = getFinScore(emp);
                                            const scoreColor = score >= 75 ? "bg-emerald-50 text-emerald-700" : score >= 60 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700";
                                            const corpStatus = getCorporateAccountStatus(emp.id);
                                            const displayName = (employeeStatuses[emp.id] as { name?: string })?.name || emp.name;
                                            return (
                                                <tr key={emp.id} className="hover:bg-[#F9FAFB]">
                                                    <td className="px-5 py-4"><div><button onClick={() => setSelectedEmployee(emp)} className="text-dashboard-primary font-semibold hover:underline text-left">{displayName}</button><p className="text-xs text-[#9CA3AF]">{emp.id}</p></div></td>
                                                    <td className="px-5 py-4">{(emp as { department?: string }).department || "Engineering"}</td>
                                                    <td className="px-5 py-4">{getSalary(emp)}</td>
                                                    <td className="px-5 py-4">{getTenure()}</td>
                                                    <td className="px-5 py-4"><span className={cn("px-2 py-1 rounded-full text-xs font-semibold", scoreColor)}>{score}</span></td>
                                                    <td className="px-5 py-4">{getProducts(emp)}</td>
                                                    <td className="px-5 py-4"><span className={cn("px-2 py-1 rounded-full text-xs font-semibold", corpStatus.className)}>{corpStatus.label}</span></td>
                                                    <td className="px-5 py-4"><button onClick={() => setSelectedEmployee(emp)} className="text-dashboard-primary font-medium hover:underline">View</button></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {hrEmployeesMainTab === "updates" && (
                    <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-12 text-center">
                        <p className="text-[#6B7280] text-sm">No updates.</p>
                    </div>
                )}

                {hrEmployeesMainTab === "manage" && (
                    <>
                        <div className="flex gap-4 border-b border-[#E5E7EB] mb-4">
                            <button type="button" onClick={() => { setManageSubTab("shared"); setManagePage(1); setSelectedForShare({}); }} className={cn("pb-3 text-sm font-semibold border-b-2 -mb-px", manageSubTab === "shared" ? "border-dashboard-primary text-dashboard-primary" : "border-transparent text-[#6B7280]")}>
                                Shared employees <span className="ml-2 text-xs font-normal text-[#9CA3AF]">({sharedList.length})</span>
                            </button>
                            <button type="button" onClick={() => { setManageSubTab("unshared"); setManagePage(1); setSelectedForShare({}); }} className={cn("pb-3 text-sm font-semibold border-b-2 -mb-px", manageSubTab === "unshared" ? "border-dashboard-primary text-dashboard-primary" : "border-transparent text-[#6B7280]")}>
                                Unshared employees <span className="ml-2 text-xs font-normal text-[#9CA3AF]">({unsharedList.length})</span>
                            </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <div className="flex-1 min-w-[200px] flex items-center bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 h-10">
                                <Search className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                                <input type="text" placeholder="Search 'Employee name'" value={manageSearchQuery} onChange={(e) => { setManageSearchQuery(e.target.value); setManagePage(1); }} className="ml-2 text-sm outline-none w-full bg-transparent" />
                            </div>
                            <button type="button" onClick={() => setShowColumnFilterModal(true)} className="h-10 px-4 border border-[#E5E7EB] bg-white text-[#374151] font-medium text-sm rounded-lg flex items-center gap-2 shrink-0 hover:bg-[#F9FAFB]">
                                <Pencil className="w-4 h-4" /> Add columns and filter
                            </button>
                            <button
                                type="button"
                                disabled={manageSubTab !== "unshared" || selectedCount === 0}
                                onClick={() => setShowShareConfirmModal(true)}
                                className="h-10 px-4 bg-[#2563EB] text-white font-medium text-sm rounded-lg flex items-center gap-2 shrink-0 hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Check className="w-4 h-4" /> Share data
                            </button>
                        </div>
                        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse min-w-[700px]">
                                    <thead className="bg-[#F9FAFB]">
                                        <tr className="border-b border-[#E5E7EB]">
                                            <th className="px-5 py-4 text-left font-semibold text-[#374151] text-xs uppercase tracking-wide w-12">
                                                {manageSubTab === "unshared" && (
                                                    <>
                                                        <input
                                                            type="checkbox"
                                                            checked={managePaginated.length > 0 && managePaginated.every((e) => selectedForShare[e.id])}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setSelectedForShare((prev) => { const next = { ...prev }; managePaginated.forEach((emp) => { next[emp.id] = true; }); return next; });
                                                                else setSelectedForShare((prev) => { const next = { ...prev }; managePaginated.forEach((emp) => { delete next[emp.id]; }); return next; });
                                                            }}
                                                            className="rounded border-[#E5E7EB]"
                                                        />
                                                        <span className="ml-2 text-[#9CA3AF] font-normal">{selectedCount} selected</span>
                                                    </>
                                                )}
                                            </th>
                                            <HeaderCell label="Employee Name" />
                                            <HeaderCell label="Employee ID" />
                                            <HeaderCell label="Email ID" />
                                            <HeaderCell label="Phone number" />
                                            {visibleOptionalColumns.map((key) => {
                                                const def = optionalColumnDefs.find((d) => d.key === key);
                                                return def ? <HeaderCell key={key} label={def.label} /> : null;
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E5E7EB]">
                                        {managePaginated.length === 0 ? (
                                            <tr><td colSpan={4 + visibleOptionalColumns.length + 1} className="px-5 py-12 text-center text-[#6B7280] text-sm">No employees found.</td></tr>
                                        ) : managePaginated.map((emp) => (
                                            <tr key={emp.id} className="hover:bg-[#F9FAFB]">
                                                <td className="px-5 py-4 w-12">
                                                    {manageSubTab === "unshared" && (
                                                        <input
                                                            type="checkbox"
                                                            checked={!!selectedForShare[emp.id]}
                                                            onChange={() => setSelectedForShare((prev) => ({ ...prev, [emp.id]: !prev[emp.id] }))}
                                                            className="rounded border-[#E5E7EB]"
                                                        />
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 font-medium text-[#111827]">{emp.name}</td>
                                                <td className="px-5 py-4 text-[#6B7280]">{emp.id}</td>
                                                <td className="px-5 py-4 text-[#6B7280]">{emp.email || "N/A"}</td>
                                                <td className="px-5 py-4 text-[#6B7280]">{emp.phone || "N/A"}</td>
                                                {visibleOptionalColumns.map((key) => (
                                                    <td key={key} className="px-5 py-4 text-[#6B7280]">{getEmpOptionalValue(emp, key)}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex justify-between items-center">
                                <div className="flex gap-3">
                                    <button disabled={managePage <= 1} onClick={() => setManagePage((p) => p - 1)} className={cn("px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm flex items-center gap-1", managePage <= 1 ? "text-[#9CA3AF] cursor-not-allowed bg-white" : "bg-white text-[#374151] hover:bg-[#F9FAFB]")}><ChevronLeft className="w-4 h-4" /> Previous</button>
                                    {Array.from({ length: Math.min(5, manageTotalPages) }, (_, i) => i + 1).map((n) => (
                                        <button key={n} type="button" onClick={() => setManagePage(n)} className={cn("px-3 py-1.5 rounded-lg text-sm", managePage === n ? "bg-dashboard-primary text-white border border-dashboard-primary" : "bg-white text-[#374151] border border-[#E5E7EB] hover:bg-[#F9FAFB]")}>{n}</button>
                                    ))}
                                    {manageTotalPages > 6 && <span className="px-1 text-[#6B7280]">...</span>}
                                    {manageTotalPages > 6 && <button type="button" onClick={() => setManagePage(manageTotalPages)} className={cn("px-3 py-1.5 rounded-lg text-sm", managePage === manageTotalPages ? "bg-dashboard-primary text-white" : "bg-white text-[#374151] border border-[#E5E7EB]")}>{manageTotalPages}</button>}
                                    <button disabled={managePage >= manageTotalPages} onClick={() => setManagePage((p) => p + 1)} className={cn("px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm flex items-center gap-1", managePage >= manageTotalPages ? "text-[#9CA3AF] cursor-not-allowed bg-white" : "bg-white text-[#374151] hover:bg-[#F9FAFB]")}>Next <ChevronRight className="w-4 h-4" /></button>
                                </div>
                                <div className="text-sm text-[#6B7280]">Page {managePage} of {manageTotalPages} <span className="ml-2 text-[#9CA3AF]">({manageFiltered.length} employees)</span></div>
                            </div>
                        </div>
                    </>
                )}

                {/* Modal: Add Columns to Filter Employees */}
                {showColumnFilterModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowColumnFilterModal(false)}>
                        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
                                <h2 className="text-lg font-bold text-[#111827]">Add Columns to Filter Employees</h2>
                                <button type="button" onClick={() => setShowColumnFilterModal(false)} className="p-2 text-[#6B7280] hover:text-[#111827]"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="px-6 py-3 border-b border-[#E5E7EB]">
                                <div className="flex items-center bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 h-10">
                                    <Search className="w-4 h-4 text-[#9CA3AF]" />
                                    <input type="text" placeholder="Search column name" value={columnFilterSearch} onChange={(e) => setColumnFilterSearch(e.target.value)} className="ml-2 text-sm outline-none w-full bg-transparent" />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto px-6 py-4">
                                <div className="grid grid-cols-3 gap-2">
                                    {filteredColumnDefs.map((col) => (
                                        <label key={col.key} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={visibleOptionalColumns.includes(col.key)}
                                                onChange={() => setVisibleOptionalColumns((prev) => prev.includes(col.key) ? prev.filter((k) => k !== col.key) : [...prev, col.key])}
                                                className="rounded border-[#E5E7EB]"
                                            />
                                            <span className="text-sm text-[#374151]">{col.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end px-6 py-4 border-t border-[#E5E7EB]">
                                <button type="button" onClick={() => setShowColumnFilterModal(false)} className="h-10 px-5 bg-[#7C3AED] text-white font-medium text-sm rounded-lg flex items-center gap-2">
                                    <Check className="w-4 h-4" /> Update
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal: Share new employees' data confirmation */}
                {showShareConfirmModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowShareConfirmModal(false)}>
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#E0E7FF] flex items-center justify-center shrink-0">
                                    <HelpCircle className="w-5 h-5 text-[#4F46E5]" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-[#111827]">Share new employees&apos; data</h2>
                                    <p className="text-sm text-[#6B7280] mt-2">Are you sure you want to share the selected employees&apos; data?</p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowShareConfirmModal(false)} className="h-10 px-4 border border-[#E5E7EB] bg-white text-[#374151] font-medium text-sm rounded-lg hover:bg-[#F9FAFB]">
                                    Leave
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSharedEmployeeIds((prev) => {
                                            const next = { ...prev };
                                            Object.keys(selectedForShare).forEach((id) => { if (selectedForShare[id]) next[id] = true; });
                                            return next;
                                        });
                                        setSelectedForShare({});
                                        setShowShareConfirmModal(false);
                                    }}
                                    className="h-10 px-4 bg-[#2563EB] text-white font-medium text-sm rounded-lg hover:bg-[#1D4ED8]"
                                >
                                    Yes, share
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    const employeeDirectoryTable = (
        <>
            {(portalMode === "rm") && (
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="text-xs font-semibold text-[#6B7280] uppercase">Filters:</span>
                    <select value={rmTenureFilter} onChange={(e) => { setRmTenureFilter(e.target.value); setDirectoryPage(1); setAccountOpenedPage(1); }} className="h-9 px-3 border border-[#E5E7EB] rounded-lg text-sm bg-white text-[#374151]">
                        <option value="">Tenure</option>
                        <option value="<12">&lt;12 months</option>
                        <option value="12-24">12-24 months</option>
                        <option value=">24">&gt;24 months</option>
                    </select>
                    <select value={rmAgeFilter} onChange={(e) => { setRmAgeFilter(e.target.value); setDirectoryPage(1); setAccountOpenedPage(1); }} className="h-9 px-3 border border-[#E5E7EB] rounded-lg text-sm bg-white text-[#374151]">
                        <option value="">Age group</option>
                        <option value="25-35">25-35</option>
                        <option value="35-45">35-45</option>
                        <option value=">45">&gt;45</option>
                    </select>
                    <select value={rmGradeFilter} onChange={(e) => { setRmGradeFilter(e.target.value); setDirectoryPage(1); setAccountOpenedPage(1); }} className="h-9 px-3 border border-[#E5E7EB] rounded-lg text-sm bg-white text-[#374151]">
                        <option value="">Grade</option>
                        {Array.from(new Set(employees.map((e) => (e as Record<string, unknown>).grade as string).filter(Boolean))).sort().map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <select value={rmIncomeFilter} onChange={(e) => { setRmIncomeFilter(e.target.value); setDirectoryPage(1); setAccountOpenedPage(1); }} className="h-9 px-3 border border-[#E5E7EB] rounded-lg text-sm bg-white text-[#374151]">
                        <option value="">Income band</option>
                        {Array.from(new Set(employees.map((e) => (e as Record<string, unknown>).income as string).filter(Boolean))).sort((a, b) => parseInt(a, 10) - parseInt(b, 10)).map((i) => <option key={i} value={i}>₹{(parseInt(i, 10) / 100000).toFixed(0)}L+</option>)}
                    </select>
                    <select value={rmDeptFilter} onChange={(e) => { setRmDeptFilter(e.target.value); setDirectoryPage(1); setAccountOpenedPage(1); }} className="h-9 px-3 border border-[#E5E7EB] rounded-lg text-sm bg-white text-[#374151]">
                        <option value="">Department</option>
                        {Array.from(new Set(employees.map((e) => (e as Record<string, unknown>).department as string).filter(Boolean))).sort().map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {(rmTenureFilter || rmAgeFilter || rmGradeFilter || rmIncomeFilter || rmDeptFilter) && (
                        <button type="button" onClick={() => { setRmTenureFilter(""); setRmAgeFilter(""); setRmGradeFilter(""); setRmIncomeFilter(""); setRmDeptFilter(""); setDirectoryPage(1); setAccountOpenedPage(1); }} className="text-sm text-dashboard-primary font-medium hover:underline">Clear filters</button>
                    )}
                </div>
            )}
            <div className="flex gap-6 border-b border-[#E5E7EB] mb-4">
                <button type="button" onClick={() => { setActiveTab("directory"); setDirectoryPage(1); setSearchQuery(""); }}
                    className={cn("pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors", activeTab === "directory" ? "border-dashboard-primary text-dashboard-primary" : "border-transparent text-[#6B7280] hover:text-[#111827]")}>
                    Employee Directory <span className="ml-2 text-xs font-normal text-[#9CA3AF]">({selectedCorporate ? corpEmployees.length : allFiltered.length})</span>
                </button>
                <button type="button" onClick={() => { setActiveTab("accountOpened"); setAccountOpenedPage(1); setSearchQuery(""); }}
                    className={cn("pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors", activeTab === "accountOpened" ? "border-dashboard-primary text-dashboard-primary" : "border-transparent text-[#6B7280] hover:text-[#111827]")}>
                    Account Opened <span className="ml-2 text-xs font-normal text-[#9CA3AF]">({selectedCorporate ? corpCompleted.length : completedEmployees.length})</span>
                </button>
            </div>
            <div className="flex-1 flex flex-col min-h-0">
                <h2 className="text-base font-bold text-[#111827] mb-4">{activeTab === "accountOpened" ? "Account Opened" : "Employee Directory"} <span className="ml-2 text-sm font-normal text-[#6B7280]">({currentList.length} employee{currentList.length !== 1 ? "s" : ""})</span></h2>
                <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center px-5 py-4 border-b border-[#E5E7EB]">
                        <div className="flex items-center bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 h-10 w-80 focus-within:ring-2 focus-within:ring-dashboard-primary/20 focus-within:border-dashboard-primary transition-all">
                            <Search className="w-4 h-4 text-[#9CA3AF]" />
                            <input type="text" placeholder="Search by name, ID, email or phone..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="ml-2 text-sm outline-none w-full bg-transparent" />
                            {searchQuery && <button onClick={() => setSearchQuery("")} className="text-[#9CA3AF] hover:text-[#374151]"><X className="w-4 h-4" /></button>}
                        </div>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={handleRefreshInvites} className="h-10 px-4 border border-[#E5E7EB] bg-white text-[#374151] font-medium text-sm rounded-lg hover:bg-[#F9FAFB] transition-colors flex items-center gap-2"><RefreshCcw className="w-4 h-4" /> Refresh all</button>
                            <button className="h-10 px-4 bg-dashboard-primary text-white font-medium text-sm rounded-lg hover:bg-dashboard-primary-dark transition-colors flex items-center gap-2 shadow-sm"><Download className="w-4 h-4" /> Download CSV</button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
                        <table className="w-full text-sm border-collapse min-w-[900px]">
                            <thead className="bg-[#F9FAFB]">
                                <tr className="border-b border-[#E5E7EB]">
                                    <HeaderCell label="Employee name" /><HeaderCell label="Phone number" /><HeaderCell label="Official Email ID" className="w-[180px]" /><HeaderCell label="Journey Category" /><HeaderCell label="Journey Status" hasFilter className="w-[160px]" /><HeaderCell label="Reference ID" className="w-[55px] px-3" /><th className="px-5 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E7EB]">
                                {paginatedList.length === 0 ? (
                                    <tr><td colSpan={7} className="px-5 py-12 text-center text-[#6B7280] text-sm">{activeTab === "accountOpened" ? "No employees have completed their journey yet." : "No employees match your search."}</td></tr>
                                ) : paginatedList.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-[#F9FAFB] transition-colors group">
                                        <td className="px-5 py-4"><button onClick={() => setSelectedEmployee(emp)} className="text-dashboard-primary font-semibold hover:underline cursor-pointer text-left">{emp.name}</button></td>
                                        <td className="px-5 py-4 text-[#6B7280]">{emp.phone}</td>
                                        <td className="px-5 py-4 text-[#6B7280] w-[180px]"><span className="block max-w-[160px] truncate" title={emp.email}>{emp.email}</span></td>
                                        <td className="px-5 py-4">{(() => { const m = getJourneyCategory(emp.journey); return <span className={cn("px-2 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap", m.className)}>{m.label}</span>; })()}</td>
                                        <td className="px-5 py-4 w-[160px]">{(() => { const b = getStatusBadge(emp.id, !!invitedEmployeeIds[emp.id], employeeStatuses); return <span className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap", b.className)}>{b.label === "Completed" && <CheckCircle2 className="w-3 h-3" />}{b.label !== "Not Started" && b.label !== "Invited" && b.label !== "Completed" && <Clock className="w-3 h-3" />}{b.label}</span>; })()}</td>
                                        <td className="px-3 py-4 text-[#9CA3AF] w-[55px]">—</td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-4">
                                                <button type="button" onClick={refreshStatuses} className="text-dashboard-primary font-medium text-xs cursor-pointer hover:underline">Refresh now</button>
                                                <button onClick={() => handleInvite(emp)} disabled={!!invitedEmployeeIds[emp.id] || employeeStatuses[emp.id]?.status === "completed"} className={cn("h-8 px-4 border border-[#E5E7EB] rounded-lg text-xs font-semibold transition-all", invitedEmployeeIds[emp.id] || employeeStatuses[emp.id]?.status === "completed" ? "bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed" : "bg-white text-[#374151] hover:bg-dashboard-primary hover:text-white hover:border-dashboard-primary")}>{employeeStatuses[emp.id]?.status === "completed" ? "Completed" : invitedEmployeeIds[emp.id] ? "Invited" : "Invite"}</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex justify-between items-center">
                        <div className="flex gap-3">
                            <button disabled={currentPage <= 1} onClick={() => setCurrentPage(currentPage - 1)} className={cn("px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm flex items-center gap-1", currentPage <= 1 ? "text-[#9CA3AF] cursor-not-allowed bg-white" : "bg-white text-[#374151] hover:bg-[#F9FAFB] cursor-pointer")}><ChevronLeft className="w-4 h-4" /> Previous</button>
                            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(currentPage + 1)} className={cn("px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm flex items-center gap-1", currentPage >= totalPages ? "text-[#9CA3AF] cursor-not-allowed bg-white" : "bg-white text-[#374151] hover:bg-[#F9FAFB] cursor-pointer")}>Next <ChevronRight className="w-4 h-4" /></button>
                        </div>
                        <div className="text-sm text-[#6B7280]">Page {currentPage} of {totalPages} <span className="ml-2 text-[#9CA3AF]">({currentList.length} employee{currentList.length !== 1 ? "s" : ""})</span></div>
                    </div>
                </div>
            </div>
        </>
    );

    if (activePage === "dashboard") {
        // RM Portal: hero, quick actions, and global analytics across all employees and product offerings
        if (portalMode === "rm") {
            const totalEmployees = employees.length;
            const personalLoanCompleted = employees.filter((e) => employeeStatuses[e.id]?.status === "completed").length;
            const personalLoanInProgress = employees.filter((e) => employeeStatuses[e.id]?.status === "in_progress").length;
            const personalLoanInvited = employees.filter(
                (e) => invitedEmployeeIds[e.id] && employeeStatuses[e.id]?.status !== "in_progress" && employeeStatuses[e.id]?.status !== "completed"
            ).length;
            const personalLoanNotStarted = totalEmployees - personalLoanCompleted - personalLoanInProgress - personalLoanInvited;
            const personalLoanUtilization = totalEmployees > 0 ? Math.round((personalLoanCompleted / totalEmployees) * 100) : 0;

            const productOfferings = [
                { name: "Personal Loan", category: "Loans", eligible: totalEmployees, applied: personalLoanInProgress + personalLoanInvited, completed: personalLoanCompleted, utilization: personalLoanUtilization },
                { name: "Wealth Advisory", category: "Wealth", eligible: totalEmployees, applied: 0, completed: 0, utilization: 0 },
                { name: "Super Credit Card", category: "Cards", eligible: totalEmployees, applied: 0, completed: 0, utilization: 0 },
                { name: "Health", category: "Benefits", eligible: totalEmployees, applied: 0, completed: 0, utilization: 0 },
                { name: "Debit Card", category: "Cards", eligible: totalEmployees, applied: 0, completed: 0, utilization: 0 },
            ];

            return (
                <>
                    <div className="mb-8 rounded-2xl overflow-hidden shadow-lg" style={{ background: "linear-gradient(135deg, #C41E3A 0%, #9B1529 60%, #8B0000 100%)" }}>
                        <div className="px-8 py-8 md:py-10">
                            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Mahindra Finance – Corporate Lending</h1>
                            <p className="text-sm md:text-base text-white/90 mt-1 max-w-xl">Manage corporates and employee personal loan journeys.</p>
                        </div>
                    </div>
                    <div className="mb-8">
                        <h2 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-5">Quick actions</h2>
                        <button
                            type="button"
                            onClick={onAddNewCorporate}
                            className="flex items-center justify-center gap-3 w-full max-w-xs h-24 rounded-2xl bg-[#E6F2FF] text-[#0066CC] hover:bg-[#CCE5FF] active:scale-[0.98] transition-all shadow-sm"
                        >
                            <Building2 className="w-8 h-8" />
                            <span className="text-sm font-semibold">Add a new corporate</span>
                        </button>
                    </div>
                    <div className="mb-8">
                        <h2 className="text-base font-bold text-[#111827] mb-5">Global analytics</h2>
                        <p className="text-sm text-[#6B7280] mb-5">Aggregate metrics across all employees and product offerings.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                            <StatCard label="Total employees" value={totalEmployees} subtitle="Across all corporates" icon={<Users className="w-6 h-6" />} color="blue" />
                            <StatCard label="Personal loan – Completed" value={personalLoanCompleted} subtitle="Journey completed" icon={<CheckCircle2 className="w-6 h-6" />} color="green" />
                            <StatCard label="Personal loan – In progress" value={personalLoanInProgress} subtitle="Application started" icon={<Clock className="w-6 h-6" />} color="orange" />
                            <StatCard label="Personal loan – Invited" value={personalLoanInvited} subtitle="Awaiting response" icon={<Send className="w-6 h-6" />} color="yellow" />
                            <StatCard label="Personal loan – Not started" value={personalLoanNotStarted} subtitle="Eligible, not invited" icon={<Users className="w-6 h-6" />} color="grey" />
                        </div>
                        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
                            <h3 className="text-sm font-semibold text-[#111827] px-5 py-4 border-b border-[#E5E7EB]">Metrics by product offering</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse min-w-[640px]">
                                    <thead className="bg-[#F9FAFB]">
                                        <tr className="border-b border-[#E5E7EB]">
                                            <th className="px-5 py-3 text-left font-semibold text-[#374151] text-xs uppercase tracking-wide">Product</th>
                                            <th className="px-5 py-3 text-left font-semibold text-[#374151] text-xs uppercase tracking-wide">Category</th>
                                            <th className="px-5 py-3 text-right font-semibold text-[#374151] text-xs uppercase tracking-wide">Eligible</th>
                                            <th className="px-5 py-3 text-right font-semibold text-[#374151] text-xs uppercase tracking-wide">Applied</th>
                                            <th className="px-5 py-3 text-right font-semibold text-[#374151] text-xs uppercase tracking-wide">Completed</th>
                                            <th className="px-5 py-3 text-right font-semibold text-[#374151] text-xs uppercase tracking-wide">Utilization %</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E5E7EB]">
                                        {productOfferings.map((p) => (
                                            <tr key={p.name} className="hover:bg-[#F9FAFB]">
                                                <td className="px-5 py-3 font-medium text-[#111827]">{p.name}</td>
                                                <td className="px-5 py-3 text-[#6B7280]">{p.category}</td>
                                                <td className="px-5 py-3 text-right text-[#111827]">{p.eligible}</td>
                                                <td className="px-5 py-3 text-right text-[#111827]">{p.applied}</td>
                                                <td className="px-5 py-3 text-right text-[#111827]">{p.completed}</td>
                                                <td className="px-5 py-3 text-right">
                                                    <span className={cn("font-medium", p.utilization > 0 ? "text-emerald-600" : "text-[#6B7280]")}>{p.utilization}%</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            );
        }
        // Super-admin / other: full dashboard with quick actions and analytics
        const quickActions = [
            { label: "Add New Connection", icon: Link2, bg: "bg-[#E6F2FF]", iconColor: "text-[#0066CC]", onClick: () => onNavigate?.("connections") },
            { label: "Add New Corporate", icon: Building2, bg: "bg-[#FFEDD5]", iconColor: "text-[#EA580C]", onClick: undefined },
            { label: "Create New Report", icon: PieChart, bg: "bg-[#EDE9FE]", iconColor: "text-[#7C3AED]", onClick: () => onNavigate?.("reporting") },
            { label: "Configure Webhook", icon: Webhook, bg: "bg-[#D1FAE5]", iconColor: "text-[#059669]", onClick: () => onNavigate?.("webhooks") },
        ];
        return (
            <>
                <div className="mb-10 rounded-2xl overflow-hidden shadow-lg" style={{ background: "linear-gradient(135deg, #004C8F 0%, #1D4ED8 60%, #1e40af 100%)" }}>
                    <div className="px-8 py-8 md:py-10">
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Mahindra Finance for Corporates</h1>
                        <p className="text-sm md:text-base text-white/90 mt-1 max-w-xl">Quick actions, analytics and insights.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
                    <div className="lg:col-span-7">
                        <h2 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-5">Quick actions to get started</h2>
                        <div className="flex flex-wrap gap-5">
                            {quickActions.map(({ label, icon: Icon, bg, iconColor, onClick }) => (
                                <button key={label} type="button" onClick={onClick} className={`flex-shrink-0 w-24 h-24 rounded-2xl ${bg} ${iconColor} flex flex-col items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-sm`}>
                                    <Icon className="w-7 h-7" />
                                    <span className="text-[10px] font-semibold text-center px-1 leading-tight max-w-[70px]">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-5">
                        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm h-full hover:shadow-md transition-shadow">
                            <h2 className="text-base font-bold text-[#111827] flex items-center gap-2 flex-wrap">
                                <span>Reporting</span>
                                <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-semibold">New</span>
                            </h2>
                            <p className="text-sm text-[#6B7280] mt-3">Check out our new reporting section for easy tracking and real-time insights!</p>
                            <button type="button" className="mt-4 h-10 px-5 bg-dashboard-primary text-white font-semibold text-sm rounded-lg hover:bg-dashboard-primary-dark transition-colors inline-flex items-center gap-2">
                                Check Reporting →
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mb-10">
                    <h2 className="text-base font-bold text-[#111827] mb-5">Connection Analytics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <StatCard label="Active" value={58} subtitle="Live connections" icon={<Link2 className="w-6 h-6" />} color="blue" />
                        <StatCard label="Pending" value={80} subtitle="Awaiting setup" icon={<Clock className="w-6 h-6" />} color="orange" />
                        <StatCard label="Terminated" value={13} subtitle="Ended" icon={<XCircle className="w-6 h-6" />} color="red" />
                    </div>
                </div>
                <div>
                    <h2 className="text-base font-bold text-[#111827] mb-5">User Analytics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <StatCard label="Total Users" value={7} subtitle="All accounts" icon={<Users className="w-6 h-6" />} color="blue" />
                        <StatCard label="Active Users" value={6} subtitle="Currently active" icon={<RefreshCcw className="w-6 h-6" />} color="green" />
                        <StatCard label="Pending Users" value={0} subtitle="Invited" icon={<Clock className="w-6 h-6" />} color="yellow" />
                        <StatCard label="Disabled Users" value={1} subtitle="Inactive" icon={<XCircle className="w-6 h-6" />} color="purple" />
                    </div>
                </div>
            </>
        );
    }

    if (activePage === "connections") {
        const activeConn = connections.filter((c) => c.status === "Active").length;
        const pendingConn = connections.filter((c) => c.status === "Pending").length;
        const termConn = connections.filter((c) => c.status === "Terminated").length;
        return (
            <>
                <p className="text-sm text-[#9CA3AF] mb-1">Dashboard</p>
                <div className="mb-6"><h1 className="text-2xl font-bold text-[#111827]">Connections</h1><p className="text-sm text-[#6B7280] mt-0.5">Hypersync console enables effortless, real-time standardized client data retrieval</p></div>
                <div className="grid grid-cols-3 gap-4 mb-6"><StatCard label="Active" value={activeConn} icon={<Rocket className="w-5 h-5" />} color="blue" /><StatCard label="Pending" value={pendingConn} icon={<Clock className="w-5 h-5" />} color="yellow" /><StatCard label="Terminated" value={termConn} icon={<XCircle className="w-5 h-5" />} color="red" /></div>
                <div className="flex gap-3 mb-4">
                    <div className="flex items-center bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 h-10 w-80"><Search className="w-4 h-4 text-[#9CA3AF]" /><input type="text" placeholder="Search corporate..." className="ml-2 text-sm outline-none w-full bg-transparent" /></div>
                    <button className="h-10 px-4 border border-[#E5E7EB] bg-white text-[#374151] font-medium text-sm rounded-lg flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</button>
                    <button className="h-10 px-4 bg-dashboard-primary text-white font-medium text-sm rounded-lg flex items-center gap-2"><Rocket className="w-4 h-4" /> Add New Connection</button>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden"><p className="px-5 py-3 text-sm text-[#6B7280]">{connections.length} connections found</p>
                    <div className="overflow-x-auto"><table className="w-full text-sm border-collapse min-w-[1000px]"><thead className="bg-[#F9FAFB]"><tr className="border-b border-[#E5E7EB]"><HeaderCell label="Corporate" /><HeaderCell label="Connection ID" /><HeaderCell label="Date Of Connection" /><HeaderCell label="Integration" /><HeaderCell label="CSM" /><HeaderCell label="Last Synced" /><HeaderCell label="Sync Frequency" /><HeaderCell label="Status" /><HeaderCell label="Steps Status" /><th className="px-5 py-4">Action</th></tr></thead><tbody className="divide-y divide-[#E5E7EB]">{paginatedConnections.map((c) => (<tr key={c.id} className="hover:bg-[#F9FAFB]"><td className="px-5 py-4">{c.corporate}</td><td className="px-5 py-4 text-[#6B7280] font-mono text-xs">{c.id}</td><td className="px-5 py-4">{c.dateOfConnection}</td><td className="px-5 py-4">{c.integration}</td><td className="px-5 py-4">{c.csm}</td><td className="px-5 py-4">{c.lastSynced}</td><td className="px-5 py-4">{c.syncFreq}</td><td className="px-5 py-4"><span className={cn("px-2 py-1 rounded-full text-xs", c.status === "Active" ? "bg-blue-50 text-blue-700" : c.status === "Pending" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700")}>{c.status}</span></td><td className="px-5 py-4 text-[#6B7280]">{c.stepsStatus}</td><td className="px-5 py-4"><button className="text-dashboard-primary hover:underline">Complete journey</button> <button className="p-1">⋮</button></td></tr>))}</tbody></table></div>
                    <div className="px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex justify-end items-center gap-2"><button disabled={connectionsPage <= 1} onClick={() => setConnectionsPage((p) => p - 1)} className="px-3 py-1.5 border rounded-lg disabled:opacity-50">‹</button>{[1, 2, 3, 4].slice(0, connectionsTotalPages).map((n) => (<button key={n} onClick={() => setConnectionsPage(n)} className={cn("px-3 py-1.5 border rounded-lg", connectionsPage === n ? "bg-dashboard-primary text-white border-dashboard-primary" : "")}>{n}</button>))}<span className="text-sm text-[#6B7280] ml-2">... {connectionsTotalPages}</span><button disabled={connectionsPage >= connectionsTotalPages} onClick={() => setConnectionsPage((p) => p + 1)} className="px-3 py-1.5 border rounded-lg disabled:opacity-50">›</button></div>
                </div>
            </>
        );
    }

    if (activePage === "rm-employees") {
        return (
            <>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-[#111827]">Employees</h1>
                    <p className="text-sm text-[#6B7280] mt-0.5">All employees across your corporates</p>
                </div>
                {employeeDirectoryTable}
            </>
        );
    }

    if (activePage === "rm-products") {
        const products = [
            { name: "Mahindra Finance Wealth Advisory", desc: "Goal-based wealth advisory and investment services for employees", status: "Active" },
            { name: "Personal Loan", desc: "Pre-approved loans for employees", status: "Active" },
            { name: "Credit Card", desc: "Millennia & premium cards", status: "Active" },
            { name: "Home Loan", desc: "Special rates for salaried", status: "Coming soon" },
        ];
        return (
            <>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-[#111827]">Products</h1>
                    <p className="text-sm text-[#6B7280] mt-0.5">Configure product eligibility for your corporates</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {products.map((p) => (
                        <div key={p.name} className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
                            <h3 className="font-semibold text-[#111827]">{p.name}</h3>
                            <p className="text-sm text-[#6B7280] mt-1">{p.desc}</p>
                            <span className={cn("inline-block mt-3 px-2 py-1 rounded-full text-xs font-medium", p.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600")}>{p.status}</span>
                        </div>
                    ))}
                </div>
            </>
        );
    }

    if (activePage === "rm-analytics") {
        const activeConn = connections.filter((c) => c.status === "Active").length;
        const pendingConn = connections.filter((c) => c.status === "Pending").length;
        return (
            <>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-[#111827]">Analytics</h1>
                    <p className="text-sm text-[#6B7280] mt-0.5">Connection and onboarding insights</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatCard label="Active Connections" value={activeConn} icon={<Rocket className="w-5 h-5" />} color="blue" />
                    <StatCard label="Pending" value={pendingConn} icon={<Clock className="w-5 h-5" />} color="yellow" />
                    <StatCard label="Corporates Onboarded" value={corporatesTableData.length} icon={<Building2 className="w-5 h-5" />} color="green" />
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 shadow-sm">
                    <h3 className="font-semibold text-[#111827] mb-4">Connection trends</h3>
                    <div className="h-48 flex items-center justify-center bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                        <p className="text-sm text-[#6B7280]">Chart placeholder — integrate with your analytics API</p>
                    </div>
                </div>
            </>
        );
    }

    if (activePage === "reporting") {
        return (<><div className="mb-6"><h1 className="text-2xl font-bold text-[#111827]">Reports</h1><p className="text-sm text-[#6B7280] mt-0.5">Create and manage reports to visualize your data.</p></div><div className="flex gap-6 border-b border-[#E5E7EB] mb-4"><button className="pb-3 text-sm font-semibold border-b-2 border-dashboard-primary text-dashboard-primary -mb-px">All Reports (0)</button><button className="pb-3 text-sm font-semibold border-b-2 border-transparent text-[#6B7280] -mb-px">Execution History (0)</button></div><div className="flex justify-between mb-6"><div className="flex items-center bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 h-10 w-80"><Search className="w-4 h-4 text-[#9CA3AF]" /><input placeholder="Search by report name." className="ml-2 text-sm outline-none w-full bg-transparent" /></div><button className="h-10 px-4 bg-dashboard-primary text-white font-medium text-sm rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" /> Create report</button></div><div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm flex-1 flex flex-col items-center justify-center min-h-[400px] py-16"><div className="w-20 h-20 rounded-xl bg-blue-50 flex items-center justify-center mb-4"><PieChart className="w-10 h-10 text-dashboard-primary" /></div><h3 className="text-lg font-bold text-[#111827] mb-2">No reports found.</h3><p className="text-sm text-[#6B7280] mb-4">Get started by creating your first report.</p><button className="h-10 px-4 bg-dashboard-primary text-white font-medium text-sm rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" /> Create report</button></div></>);
    }

    if (activePage === "corporates") {
            if (selectedCorporate) {
            const corpMeta = corporatesTableData.find((c) => c.corporateName === selectedCorporate);
            const corpCategory = corpMeta?.corpCategory || "CAT A";
            const corpBenefitsBase = [
                { name: "Mahindra Finance Personal Loan", category: "Loans", pct: 45, count: 562 },
                { name: "Mahindra Finance Super Credit Card", category: "Cards", pct: 68, count: 847 },
                { name: "Mahindra Finance Health", category: "Benefits", pct: 89, count: 1109 },
                { name: "Mahindra Finance Wealth Advisory", category: "Wealth", pct: 34, count: 424 },
                { name: "Mahindra Finance Debit Card", category: "Cards", pct: 52, count: 650 },
            ];
            const corpBenefits = corpBenefitsBase.map((b) => {
                let enabled = true;
                if (corpCategory === "CAT B" && b.name === "Mahindra Finance Wealth Advisory") enabled = false;
                if (corpCategory === "CAT C" && b.category !== "Loans") enabled = false;
                return { ...b, enabled };
            });
            const corpKey = selectedCorporate;
            const corpToggles: Record<number, boolean> = (() => {
                const def = Object.fromEntries(corpBenefits.map((b, i) => [i, b.enabled])) as Record<number, boolean>;
                const overrides = corporateBenefitToggles[corpKey] || {};
                return { ...def, ...overrides };
            })();

            return (
                <>
                    <div className="mb-6">
                        <button
                            onClick={() => setSelectedCorporate(null)}
                            className="flex items-center gap-2 text-sm text-dashboard-primary font-medium hover:underline"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Corporates
                        </button>
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-[#111827] mb-1">{selectedCorporate}</h1>
                            <p className="text-sm text-[#6B7280]">
                                Configure services and view the employee directory for this corporate.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {corpMeta && (
                                <>
                                    {corpMeta.corpCategory && (
                                        <span
                                            className={cn(
                                                "px-2 py-1 rounded-full text-xs font-semibold",
                                                corpMeta.corpCategory === "CAT A"
                                                    ? "bg-dashboard-primary-light text-dashboard-primary"
                                                    : corpMeta.corpCategory === "CAT B"
                                                        ? "bg-amber-50 text-amber-700"
                                                        : "bg-slate-100 text-slate-600"
                                            )}
                                        >
                                            Category: {corpMeta.corpCategory}
                                        </span>
                                    )}
                                    {corpMeta.kybStatus && (
                                        <span
                                            className={cn(
                                                "px-2 py-1 rounded-full text-xs font-medium",
                                                corpMeta.kybStatus === "Verified"
                                                    ? "bg-[#ECFDF5] text-[#059669]"
                                                    : corpMeta.kybStatus === "In Review"
                                                        ? "bg-amber-50 text-amber-700"
                                                        : "bg-slate-100 text-slate-600"
                                            )}
                                        >
                                            KYB: {corpMeta.kybStatus}
                                        </span>
                                    )}
                                </>
                            )}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setCorporateServicesDropdownOpen((o) => !o)}
                                    className={cn(
                                        "flex items-center gap-1.5 h-9 px-3 rounded-lg border text-sm font-medium transition-colors",
                                        corporateServicesDropdownOpen
                                            ? "border-dashboard-primary bg-dashboard-primary-light text-dashboard-primary"
                                            : "border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]"
                                    )}
                                >
                                    Services ({corpBenefits.length})
                                    <ChevronDown className={cn("w-4 h-4 transition-transform", corporateServicesDropdownOpen && "rotate-180")} />
                                </button>
                                {corporateServicesDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" aria-hidden onClick={() => setCorporateServicesDropdownOpen(false)} />
                                        <div className="absolute right-0 top-full mt-1 z-20 w-[360px] max-h-[80vh] overflow-auto bg-white border border-[#E5E7EB] rounded-xl shadow-lg py-2">
                                            <div className="px-3 pb-2 border-b border-[#E5E7EB] mb-2">
                                                <h3 className="text-sm font-semibold text-[#111827]">Services for this corporate</h3>
                                                <p className="text-xs text-[#6B7280] mt-0.5">Enable or disable schemes by category.</p>
                                            </div>
                                            <div className="space-y-0">
                                                {corpBenefits.map((b, i) => (
                                                    <div key={b.name} className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-[#F9FAFB]">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-medium text-[#111827] truncate">{b.name}</p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-[#F3F4F6] text-[#6B7280]">{b.category}</span>
                                                                <span className="text-xs text-[#9CA3AF]">{b.pct}% · {b.count} eligible</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setCorporateBenefitToggles((prev) => {
                                                                    const existing = prev[corpKey] || {};
                                                                    const current = corpToggles[i] ?? b.enabled;
                                                                    return {
                                                                        ...prev,
                                                                        [corpKey]: { ...existing, [i]: !current },
                                                                    };
                                                                });
                                                            }}
                                                            className={cn(
                                                                "w-10 h-5 rounded-full transition-colors shrink-0 flex items-center",
                                                                (corpToggles[i] ?? b.enabled) ? "bg-dashboard-primary justify-end" : "bg-[#E5E7EB] justify-start"
                                                            )}
                                                        >
                                                            <span className="w-4 h-4 rounded-full bg-white shadow-sm mx-0.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-[#111827] mb-3">Employees</h2>
                        {employeeDirectoryTable}
                    </div>
                </>
            );
        }
        return (
            <>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-[#111827]">Corporates</h1>
                    <p className="text-sm text-[#6B7280] mt-0.5">Manage all corporate entities and their integrations</p>
                </div>
                <div className="flex gap-3 mb-4">
                    <div className="flex items-center bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 h-10 w-80">
                        <Search className="w-4 h-4 text-[#9CA3AF]" />
                        <input type="text" placeholder="Search corporates..." value={corporatesSearch} onChange={(e) => { setCorporatesSearch(e.target.value); setCorporatesPage(1); }} className="ml-2 text-sm outline-none w-full bg-transparent" />
                    </div>
                    <button type="button" className="h-10 px-4 border border-[#E5E7EB] bg-white text-[#374151] font-medium text-sm rounded-lg flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filters
                    </button>
                    {portalMode !== "hr" && onAddNewCorporate && (
                        <button type="button" onClick={onAddNewCorporate} className="h-10 px-4 bg-dashboard-primary text-white font-medium text-sm rounded-lg flex items-center gap-2 ml-auto">
                            <Plus className="w-4 h-4" /> Add New Corporate
                        </button>
                    )}
                </div>
                <p className="text-sm text-[#6B7280] mb-3">{filteredCorporates.length} corporates found</p>
                <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse min-w-[900px]">
                            <thead className="bg-[#F9FAFB]">
                                <tr className="border-b border-[#E5E7EB]">
                                    <th className="px-5 py-4 text-left font-semibold text-[#374151] text-xs uppercase tracking-wide">Corporate Name</th>
                                    <th className="px-5 py-4 text-left font-semibold text-[#374151] text-xs uppercase tracking-wide">Categories</th>
                                    <th className="px-5 py-4 text-left font-semibold text-[#374151] text-xs uppercase tracking-wide">Connections</th>
                                    <th className="px-5 py-4 text-left font-semibold text-[#374151] text-xs uppercase tracking-wide">Category</th>
                                    <th className="px-5 py-4 text-left font-semibold text-[#374151] text-xs uppercase tracking-wide">KYB Status</th>
                                    <th className="px-5 py-4 text-left font-semibold text-[#374151] text-xs uppercase tracking-wide">Status</th>
                                    <th className="px-5 py-4 text-left font-semibold text-[#374151] text-xs uppercase tracking-wide">Contact Name</th>
                                    <th className="px-5 py-4 text-left font-semibold text-[#374151] text-xs uppercase tracking-wide">
                                        <span className="flex items-center gap-1">Date Added <ChevronsUpDown className="w-4 h-4" /></span>
                                    </th>
                                    <th className="px-5 py-4 text-left font-semibold text-[#374151] text-xs uppercase tracking-wide">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E7EB]">
                                {paginatedCorporates.map((row, idx) => {
                                    const initials = row.corporateName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
                                    const colorIdx = (corporatesPage - 1) * 10 + idx;
                                    const avatarBg = ["bg-[#E6F2FF]", "bg-[#D1FAE5]", "bg-[#EDE9FE]", "bg-[#FFEDD5]", "bg-[#FEE2E2]"][colorIdx % 5];
                                    const avatarColor = ["text-[#0066CC]", "text-[#059669]", "text-[#7C3AED]", "text-[#EA580C]", "text-[#DC2626]"][colorIdx % 5];
                                    return (
                                    <tr key={`corporate-${colorIdx}`} className="hover:bg-[#F9FAFB] transition-colors">
                                        <td className="px-5 py-4">
                                            <button type="button" onClick={() => setSelectedCorporate(row.corporateName)} className="flex items-center gap-3 text-left group">
                                                <span className={cn("w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0", avatarBg, avatarColor)}>{initials}</span>
                                                <span className="text-dashboard-primary font-semibold group-hover:underline">{row.corporateName}</span>
                                            </button>
                                        </td>
                                        <td className="px-5 py-4">
                                            {row.categories ? (
                                                <span className={cn("px-2 py-1 rounded-full text-xs font-medium", row.categories.includes("HRIS") ? "bg-[#E6F2FF] text-[#0066CC]" : row.categories.includes("Payroll") ? "bg-[#EDE9FE] text-[#7C3AED]" : "bg-[#D1FAE5] text-[#059669]")}>{row.categories}</span>
                                            ) : (
                                                <span className="text-[#9CA3AF]">-</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            {row.connections ? (
                                                <span className="px-2 py-1 rounded-full text-xs bg-[#F3F4F6] text-[#6B7280]">{row.connections}</span>
                                            ) : (
                                                <span className="text-[#9CA3AF]">-</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            {row.corpCategory ? (
                                                <span className={cn("px-2 py-1 rounded-full text-xs font-semibold", row.corpCategory === "CAT A" ? "bg-dashboard-primary-light text-dashboard-primary" : row.corpCategory === "CAT B" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600")}>{row.corpCategory}</span>
                                            ) : (
                                                <span className="text-[#9CA3AF]">-</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            {row.kybStatus ? (
                                                <span className={cn("px-2 py-1 rounded-full text-xs font-medium", row.kybStatus === "Verified" ? "bg-[#ECFDF5] text-[#059669]" : row.kybStatus === "In Review" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600")}>{row.kybStatus}</span>
                                            ) : (
                                                <span className="text-[#9CA3AF]">-</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={cn("px-2 py-1 rounded-full text-xs font-medium", row.status === "Active" ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#F3F4F6] text-[#6B7280]")}>{row.status}</span>
                                        </td>
                                        <td className="px-5 py-4 text-[#6B7280]">{row.contactName || "-"}</td>
                                        <td className="px-5 py-4 text-[#6B7280]">{row.dateAdded}</td>
                                        <td className="px-5 py-4">
                                            <button type="button" className="h-8 px-3 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] text-xs font-medium transition-colors">Open</button>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex justify-between items-center">
                        <div className="text-sm text-[#6B7280]">Page {corporatesPage} of {corporatesTotalPages}</div>
                        <div className="flex items-center gap-1">
                            <button disabled={corporatesPage <= 1} onClick={() => setCorporatesPage((p) => p - 1)} className="px-3 py-1.5 border border-[#E5E7EB] rounded-lg disabled:opacity-50 hover:bg-white">‹</button>
                            {[1, 2, 3, 4].filter((n) => n <= corporatesTotalPages).map((n) => (
                                <button key={n} onClick={() => setCorporatesPage(n)} className={cn("px-3 py-1.5 border rounded-lg min-w-[36px]", corporatesPage === n ? "bg-dashboard-primary text-white border-dashboard-primary" : "border-[#E5E7EB] hover:bg-white")}>{n}</button>
                            ))}
                            {corporatesTotalPages > 4 && <span className="px-1 text-[#6B7280]">...</span>}
                            {corporatesTotalPages > 4 && <button onClick={() => setCorporatesPage(corporatesTotalPages)} className={cn("px-3 py-1.5 border rounded-lg min-w-[36px]", corporatesPage === corporatesTotalPages ? "bg-dashboard-primary text-white border-dashboard-primary" : "border-[#E5E7EB] hover:bg-white")}>{corporatesTotalPages}</button>}
                            <button disabled={corporatesPage >= corporatesTotalPages} onClick={() => setCorporatesPage((p) => p + 1)} className="px-3 py-1.5 border border-[#E5E7EB] rounded-lg disabled:opacity-50 hover:bg-white">›</button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (activePage === "integrations") {
        const filteredHrms = hrmsSearch.trim()
            ? hrmsIntegrations.filter((h) => h.name.toLowerCase().includes(hrmsSearch.toLowerCase()))
            : hrmsIntegrations;
        return (
            <>
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#111827]">HRMS Integrations</h1>
                        <p className="text-sm text-[#6B7280] mt-0.5">Explore the HRMS integrations available on our platform.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowHrmsRequestModal(true)}
                        className="text-sm text-dashboard-primary font-semibold hover:underline"
                    >
                        Can&apos;t find your HRMS? click here
                    </button>
                </div>
                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg">
                        <Infinity className="w-4 h-4 text-[#6B7280]" /> HRMS
                    </div>
                    <div className="flex items-center bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 h-10 w-64">
                        <Search className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                        <input
                            placeholder="Search"
                            value={hrmsSearch}
                            onChange={(e) => setHrmsSearch(e.target.value)}
                            className="ml-2 text-sm outline-none w-full bg-transparent"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredHrms.map((h) => (
                        <div key={h.name} className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg font-bold text-[#6B7280]">
                                    {h.name.slice(0, 2)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-[#111827] truncate">{h.name}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {showHrmsRequestModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowHrmsRequestModal(false)}>
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                            <h2 className="text-lg font-bold text-[#111827] mb-1">Request new integration</h2>
                            <p className="text-sm text-[#6B7280] mb-4">Specify the HRMS you use and our team will integrate it!</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#374151] mb-1">Please specify the name of HRMS you use *</label>
                                    <input type="text" placeholder="Enter HRMS name" value={hrmsRequestName} onChange={(e) => setHrmsRequestName(e.target.value)} className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#374151] mb-1">HRMS URL</label>
                                    <input type="url" placeholder="Enter HRMS URL" value={hrmsRequestUrl} onChange={(e) => setHrmsRequestUrl(e.target.value)} className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#374151] mb-1">Please upload the API documentation of the HRMS you use.</label>
                                    <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-6 text-center text-sm text-[#6B7280]">
                                        <span className="inline-block mb-2">↑ Upload your file</span>
                                        <p className="text-xs">.doc, .docx, .ppt, .pdf, .txt. File size max 20 MB.</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#374151] mb-1">Any other thing you would like to mention.</label>
                                    <textarea placeholder="Enter message" value={hrmsRequestMessage} onChange={(e) => setHrmsRequestMessage(e.target.value)} maxLength={255} className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm resize-none h-24" />
                                    <p className="text-xs text-[#9CA3AF] mt-1">{hrmsRequestMessage.length}/255</p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setShowHrmsRequestModal(false)} className="h-10 px-4 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#374151]">Cancel</button>
                                <button type="button" onClick={() => setShowHrmsRequestModal(false)} className="h-10 px-4 bg-dashboard-primary text-white rounded-lg text-sm font-medium">Send request</button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    if (activePage === "data-models") {
        const categories: { key: string; label: string; desc?: string }[] = [
            { key: "basic_info_fields", label: "Mandatory data points", desc: "Employee basic info includes all the data points that are mandatory" },
            { key: "detail_info_fields", label: "Employee Detailed Info", desc: "Comprehensive employee profile comprising details such as full name, work email, employment status, date of birth, date of joining, etc" },
            { key: "bank_details_fields", label: "Bank Details", desc: "Employee's bank account details" },
            { key: "dependent_details_fields", label: "Dependent Details", desc: "Family member's data for an employee" },
            { key: "salary_details_fields", label: "Salary Details", desc: "Employee's salary details" },
            { key: "ctc_details_fields", label: "CTC Details", desc: "Cost to company breakdown" },
            { key: "salary_monthly_details_fields", label: "Salary Monthly Details", desc: "Monthly salary breakdown" },
        ];
        return (
            <>
                <div className="mb-6"><h1 className="text-2xl font-bold text-[#111827]">Data Models</h1><p className="text-sm text-[#6B7280] mt-0.5">Customise data models as per your requirement</p></div>
                <div className="space-y-6">
                    {categories.map(({ key, label, desc }) => {
                        const fields = dataModelsData[key] as Record<string, { display_name: string; is_checked?: boolean }> | undefined;
                        if (!fields) return null;
                        const isBasic = key === "basic_info_fields";
                        return (
                            <div key={key} className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between">
                                    <h2 className="font-semibold text-[#111827]">{isBasic ? "*" : ""}{label}{isBasic && <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">Required</span>}</h2>
                                    {isBasic && <button className="text-sm text-dashboard-primary font-medium border border-dashboard-primary px-3 py-1.5 rounded-lg">Customize required fields</button>}
                                </div>
                                <div className="p-6">
                                    {desc && <p className="text-sm text-[#6B7280] mb-4">{desc}</p>}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {Object.entries(fields).map(([fk, fv]) => {
                                            if (typeof fv !== "object" || !fv?.display_name) return null;
                                            const checked = (dataModelState[key] as Record<string, boolean>)?.[fk] ?? (fv as { is_checked?: boolean }).is_checked ?? false;
                                            return (
                                                <label key={fk} className="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" checked={checked} onChange={() => setDataModelState((s) => ({ ...s, [key]: { ...(s[key] || {}), [fk]: !checked } }))} className="rounded border-[#E5E7EB]" />
                                                    <span className="text-sm font-medium text-[#111827]">{fv.display_name}{isBasic && " *"}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-6 flex justify-end"><button className="h-10 px-6 bg-dashboard-primary text-white font-medium text-sm rounded-lg">Save changes</button></div>
            </>
        );
    }

    if (activePage === "webhooks") {
        return (
            <>
                <div className="mb-6 flex justify-between items-start"><div><h1 className="text-2xl font-bold text-[#111827]">Webhooks</h1><p className="text-sm text-[#6B7280] mt-0.5">Manage webhooks for real-time updates and seamless integrations</p></div><div className="flex gap-2"><button className="h-10 px-4 border border-dashboard-primary text-dashboard-primary font-medium rounded-lg">Edit</button><button className="h-10 px-4 bg-dashboard-primary text-white font-medium rounded-lg">Save webhook</button></div></div>
                <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-bold text-[#111827] mb-4">Configure webhook</h2>
                    <div className="mb-4"><label className="block text-sm font-medium text-[#374151] mb-2">Webhook endpoint</label><div className="flex gap-2"><span className="flex items-center px-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-l-lg text-sm text-[#6B7280]">https://</span><input type="text" value={webhookEndpoint} onChange={(e) => setWebhookEndpoint(e.target.value)} className="flex-1 border border-[#E5E7EB] rounded-r-lg px-3 py-2 text-sm" /><button className="h-10 px-4 text-dashboard-primary font-medium flex items-center gap-2"><Send className="w-4 h-4" /> Send test request</button></div></div>
                    <div className="mb-4"><label className="block text-sm font-medium text-[#374151] mb-2">Headers</label><p className="text-sm text-[#6B7280] mb-2">Specify for what kind of events this webhook should be Triggered or <a href="#" className="text-dashboard-primary hover:underline">learn more about webhook</a>.</p><table className="w-full text-sm border border-[#E5E7EB] rounded-lg overflow-hidden"><thead><tr className="bg-[#F9FAFB]"><th className="px-4 py-3 text-left font-semibold">Key</th><th className="px-4 py-3 text-left font-semibold">Value</th></tr></thead><tbody><tr><td className="px-4 py-3 border-t border-[#E5E7EB]">tartan-signature</td><td className="px-4 py-3 border-t border-[#E5E7EB] text-[#6B7280]">Your API should verify incoming POST requests with this signature for authenticity. For more info check <a href="#" className="text-dashboard-primary">webhook doc.</a></td></tr></tbody></table><button className="mt-2 text-sm text-dashboard-primary font-medium flex items-center gap-1"><Plus className="w-4 h-4" /> Add more headers</button></div>
                    <div><label className="block text-sm font-medium text-[#374151] mb-2">Emit webhook for</label><div className="space-y-2">{[{ name: "Sync process started", desc: "When initial employee data sync process begins." }, { name: "New employee added", desc: "When new employee record has been added during the sync." }].map((ev) => (<div key={ev.name} className="flex items-start gap-3 p-4 border border-[#E5E7EB] rounded-lg"><input type="checkbox" checked={webhookEvents[ev.name] ?? false} onChange={() => setWebhookEvents((s) => ({ ...s, [ev.name]: !(s[ev.name] ?? false) }))} className="mt-1" /><div className="flex-1"><div className="font-medium text-[#111827]">{ev.name}</div><div className="text-sm text-[#6B7280]">{ev.desc}</div></div></div>))}</div></div>
                </div>
            </>
        );
    }

    if (activePage === "diagnostics") {
        return (
            <>
                <div className="mb-6"><h1 className="text-2xl font-bold text-[#111827]">Diagnostics</h1><p className="text-sm text-[#6B7280] mt-0.5">Monitor data flow and system status across all corporate connections</p></div>
                <div className="mb-4 flex justify-between items-center"><div><h2 className="text-base font-bold text-[#111827]">Corporate connections overview</h2><p className="text-sm text-[#6B7280]">Showing connection status and data flow metrics</p></div><button className="h-10 px-4 border border-[#E5E7EB] bg-white text-[#374151] font-medium text-sm rounded-lg flex items-center gap-2">Select date</button></div>
                <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm border-collapse min-w-[800px]"><thead className="bg-[#F9FAFB]"><tr className="border-b border-[#E5E7EB]"><HeaderCell label="Corporate Name" /><HeaderCell label="Connection Type" /><HeaderCell label="Data Posting Status" /><HeaderCell label="Data Receiving Status" /><HeaderCell label="Authentication Status" /><th className="px-5 py-4">View Received Data</th></tr></thead><tbody className="divide-y divide-[#E5E7EB]">{paginatedDiag.map((d, i) => (<tr key={i} className="hover:bg-[#F9FAFB]"><td className="px-5 py-4">{d.corporate}</td><td className="px-5 py-4"><span className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs">HRMS</span></td><td className={cn("px-5 py-4 font-medium", d.dataPosting === "Failed" ? "text-red-600" : d.dataPosting === "Success" ? "text-green-600" : "text-[#6B7280]")}>{d.dataPosting}</td><td className={cn("px-5 py-4 font-medium", d.dataReceiving === "Failed" ? "text-red-600" : d.dataReceiving === "Success" ? "text-green-600" : "text-[#6B7280]")}>{d.dataReceiving}</td><td className={cn("px-5 py-4 font-medium", d.authStatus === "Invalid" ? "text-red-600" : d.authStatus === "Valid" ? "text-green-600" : "text-[#6B7280]")}>{d.authStatus}</td><td className="px-5 py-4"><button className="text-dashboard-primary hover:underline">View</button></td></tr>))}</tbody></table></div>
                    <div className="px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex justify-end items-center gap-2"><button disabled={diagPage <= 1} onClick={() => setDiagPage((p) => p - 1)} className="px-3 py-1.5 border rounded-lg disabled:opacity-50">‹</button><span className="text-sm text-[#6B7280]">Page {diagPage} of {diagTotalPages}</span><button disabled={diagPage >= diagTotalPages} onClick={() => setDiagPage((p) => p + 1)} className="px-3 py-1.5 border rounded-lg disabled:opacity-50">›</button></div>
                </div>
            </>
        );
    }

    return null;
}
