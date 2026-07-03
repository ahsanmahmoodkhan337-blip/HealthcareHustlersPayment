"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ReceiptFromApi {
  id: string;
  receiptNumber: string;
  studentName: string;
  phoneNumber: string;
  emailAddress: string;
  amountPaid: number;
  paymentMode: string;
  paymentModeOther: string | null;
  isInstallment: boolean;
  remainingAmount: number | null;
  nextDueDate: string | null;
  paymentDate: string;
  createdAt: string;
}

interface DailySummary {
  date: string;
  totalAmount: number;
  receiptCount: number;
  isDone: boolean;
}

interface InstallmentEntry {
  id: string;
  fullName: string;
  firstInstallmentPaid: number;
  remainingAmount: number;
  nextDueDate: string;
  daysRemaining: number;
}

type SortKey = "receiptNumber" | "studentName" | "amountPaid" | "paymentDate";
type SortDir = "asc" | "desc";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [receipts, setReceipts] = useState<ReceiptFromApi[]>([]);
  const [installments, setInstallments] = useState<InstallmentEntry[]>([]);
  const [stats, setStats] = useState({ totalAmount: 0, totalReceipts: 0 });
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("paymentDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingDate, setTogglingDate] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [receiptsRes, statsRes, installmentsRes, dailyRes] =
        await Promise.all([
          fetch("/api/receipts"),
          fetch("/api/admin/stats"),
          fetch("/api/admin/installments"),
          fetch("/api/admin/daily-summary"),
        ]);

      if (receiptsRes.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (!receiptsRes.ok || !statsRes.ok || !installmentsRes.ok || !dailyRes.ok) {
        throw new Error("Failed to load dashboard data");
      }

      const receiptsData = await receiptsRes.json();
      const statsData = await statsRes.json();
      const installmentsData = await installmentsRes.json();
      const dailyData = await dailyRes.json();

      setReceipts(receiptsData.receipts || []);
      setStats({
        totalAmount: statsData.totalAmount || 0,
        totalReceipts: statsData.totalReceipts || 0,
      });

      const rawInstallments: ReceiptFromApi[] =
        installmentsData.installments || [];
      const now = new Date();
      const mapped: InstallmentEntry[] = rawInstallments.map((r) => {
        const dueDate = r.nextDueDate ? new Date(r.nextDueDate) : null;
        const daysRemaining = dueDate
          ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        return {
          id: r.id,
          fullName: r.studentName,
          firstInstallmentPaid: r.amountPaid,
          remainingAmount: r.remainingAmount ?? 0,
          nextDueDate: dueDate ? dueDate.toLocaleDateString("en-GB") : "N/A",
          daysRemaining,
        };
      });
      setInstallments(mapped);
      setDailySummaries(dailyData.summaries || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const handleToggleDone = async (date: string) => {
    setTogglingDate(date);
    try {
      const res = await fetch("/api/admin/daily-summary/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });
      if (!res.ok) throw new Error("Failed to toggle");
      toast.success(`Daily reconciliation updated for ${date}`);
      fetchData();
    } catch {
      toast.error("Failed to update. Please try again.");
    } finally {
      setTogglingDate(null);
    }
  };

  const filteredReceipts = receipts.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.receiptNumber.toLowerCase().includes(q) ||
      r.studentName.toLowerCase().includes(q) ||
      r.phoneNumber.includes(q)
    );
  });

  const sortedReceipts = [...filteredReceipts].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "receiptNumber":
        cmp = a.receiptNumber.localeCompare(b.receiptNumber);
        break;
      case "studentName":
        cmp = a.studentName.localeCompare(b.studentName);
        break;
      case "amountPaid":
        cmp = a.amountPaid - b.amountPaid;
        break;
      case "paymentDate":
        cmp = new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime();
        break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const getDueDateStatus = (daysRemaining: number) => {
    if (daysRemaining < 0)
      return { label: "Overdue", className: "bg-red-100 text-red-700" };
    if (daysRemaining <= 5)
      return {
        label: `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`,
        className: "bg-orange-100 text-orange-700",
      };
    return {
      label: `${daysRemaining} days left`,
      className: "bg-green-100 text-green-700",
    };
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <span className="ml-1 text-gray-300">&#8693;</span>;
    return sortDir === "asc" ? <span className="ml-1">&#8593;</span> : <span className="ml-1">&#8595;</span>;
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-brand-light">
        <div className="flex items-center gap-2 text-gray-500">
          <svg className="h-6 w-6 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-brand-light">
        <p className="text-red-600">{error}</p>
        <button onClick={() => router.push("/admin/login")} className="btn-primary">Back to Login</button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-brand-light">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img
              src="/healthcare-hustlers-logo.png"
              alt="Healthcare Hustlers"
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-lg font-bold text-brand-dark">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">Invoice Portal</p>
            </div>
          </div>
          <Link href="/admin/login" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100">Logout</Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Daily Metrics */}
        <div className="card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Today&apos;s Collections</p>
              <p className="text-3xl font-bold text-brand-dark">PKR {stats.totalAmount.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2">
              <span className="text-sm font-medium text-brand-blue">{stats.totalReceipts} receipt{stats.totalReceipts !== 1 ? "s" : ""} today</span>
            </div>
          </div>
        </div>

        {/* Daily Reconciliation */}
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-brand-dark">Daily Reconciliation</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Total Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Receipt Count</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dailySummaries.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">No daily records found.</td></tr>
                ) : (
                  dailySummaries.map((ds) => (
                    <tr key={ds.date} className="transition-colors hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{ds.date}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">PKR {ds.totalAmount.toLocaleString()}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{ds.receiptCount}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {ds.isDone ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                            &#10003; Done
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                            &#9679; Pending
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <button
                          onClick={() => handleToggleDone(ds.date)}
                          disabled={togglingDate === ds.date}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            ds.isDone
                              ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                              : "bg-brand-blue text-white hover:bg-brand-blue-dark"
                          } disabled:opacity-50`}
                        >
                          {togglingDate === ds.date ? "..." : ds.isDone ? "Undo" : "Mark Done"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Master Payments Log */}
        <div className="card">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-brand-dark">Master Payments Log</h2>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by receipt #, name, or phone..."
              className="input-field max-w-xs"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500" onClick={() => handleSort("receiptNumber")}>Receipt # <SortIcon column="receiptNumber" /></th>
                  <th className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500" onClick={() => handleSort("studentName")}>Student Name <SortIcon column="studentName" /></th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Payment Mode</th>
                  <th className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500" onClick={() => handleSort("amountPaid")}>Amount <SortIcon column="amountPaid" /></th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Remaining</th>
                  <th className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500" onClick={() => handleSort("paymentDate")}>Payment Date <SortIcon column="paymentDate" /></th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Next Due</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedReceipts.length === 0 ? (
                  <tr><td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-500">{searchQuery ? "No receipts match your search." : "No receipts yet."}</td></tr>
                ) : (
                  sortedReceipts.map((r) => (
                    <tr key={r.id} className="transition-colors hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-gray-900">{r.receiptNumber}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{r.studentName}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{r.phoneNumber}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{r.emailAddress}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                        {r.paymentMode === "OTHER" && r.paymentModeOther ? r.paymentModeOther : r.paymentMode}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">PKR {r.amountPaid.toLocaleString()}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                        {r.isInstallment ? `PKR ${(r.remainingAmount ?? 0).toLocaleString()}` : "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{new Date(r.paymentDate).toLocaleDateString()}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                        {r.nextDueDate ? new Date(r.nextDueDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${r.isInstallment ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                          {r.isInstallment ? "Installment" : "Full"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Installment Tracker Pipeline */}
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-brand-dark">Installment Tracker Pipeline</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Student Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">1st Installment Paid</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Remaining Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Due Date Countdown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {installments.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">No installment records found.</td></tr>
                ) : (
                  installments.map((entry) => {
                    const status = getDueDateStatus(entry.daysRemaining);
                    const rowClass = entry.daysRemaining <= 5 ? "bg-orange-50/50" : entry.daysRemaining < 0 ? "bg-red-50/50" : "";
                    return (
                      <tr key={entry.id} className={rowClass}>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{entry.fullName}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">PKR {entry.firstInstallmentPaid?.toLocaleString() || "-"}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">PKR {entry.remainingAmount?.toLocaleString() || "-"}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>{status.label}</span>
                            <span className="text-xs text-gray-500">(Due: {entry.nextDueDate})</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}