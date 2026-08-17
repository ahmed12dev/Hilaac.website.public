"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { MemberRecord } from "@/app/api/site-admin/members/route";
import { cn, formatDate } from "@/lib/utils";

const REGIONS = [
  "All",
  "Banaadir",
  "Galmudug",
  "Puntland",
  "Hirshabelle",
  "South West",
  "Jubaland",
  "Somaliland",
  "Diaspora",
];

export function MembersManager() {
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [busy, setBusy] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState("Banaadir");
  const [district, setDistrict] = useState("");
  const [gender, setGender] = useState("Male");

  async function loadMembers() {
    setLoading(true);
    try {
      const res = await fetch("/api/site-admin/members");
      const data = await res.json();
      if (data.ok && Array.isArray(data.members)) {
        setMembers(data.members);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const q = search.toLowerCase().trim();
      if (q) {
        const match =
          m.fullName.toLowerCase().includes(q) ||
          m.membershipNumber.toLowerCase().includes(q) ||
          m.phone.includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.district.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (selectedRegion !== "All" && m.region !== selectedRegion) return false;
      if (selectedStatus !== "All" && m.status !== selectedStatus) return false;
      return true;
    });
  }, [members, search, selectedRegion, selectedStatus]);

  async function updateStatus(id: string, newStatus: "verified" | "active" | "pending") {
    setMembers((list) =>
      list.map((m) => (m.id === id ? { ...m, status: newStatus } : m)),
    );
    await fetch("/api/site-admin/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    }).catch(() => undefined);
  }

  async function deleteMember(id: string) {
    if (!confirm("Are you sure you want to delete this member registration?")) return;
    setMembers((list) => list.filter((m) => m.id !== id));
    await fetch("/api/site-admin/members", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => undefined);
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !phone) return;
    setBusy(true);
    try {
      const res = await fetch("/api/site-admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, email, region, district, gender }),
      });
      const data = await res.json();
      if (data.ok && data.member) {
        setMembers((prev) => [data.member, ...prev]);
        setShowAddModal(false);
        setFullName("");
        setPhone("");
        setEmail("");
        setDistrict("");
      }
    } finally {
      setBusy(false);
    }
  }

  function exportCSV() {
    const headers = ["Membership ID,Full Name,Phone,Email,Region,District,Gender,Status,Joined Date"];
    const rows = filteredMembers.map(
      (m) =>
        `"${m.membershipNumber}","${m.fullName}","${m.phone}","${m.email}","${m.region}","${m.district}","${m.gender}","${m.status}","${m.joinedAt}"`,
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `xisbiga-hilaac-members-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const verifiedCount = members.filter((m) => m.status === "verified").length;
  const activeCount = members.filter((m) => m.status === "active").length;
  const pendingCount = members.filter((m) => m.status === "pending").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Members Registry</h1>
          <p className="mt-1 text-sm text-ink-400">
            Real-time party membership database, verification, and roster exports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadMembers()}
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-ink-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </button>

          <button
            onClick={exportCSV}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-semibold text-ink-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Download className="h-3.5 w-3.5 text-gold-400" />
            Export CSV
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gold-gradient px-4 text-xs font-bold text-ink-950 shadow-gold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add Member
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between text-ink-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Registered</span>
            <Users className="h-4 w-4 text-gold-400" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold">{members.length}</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-4">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Verified Members</span>
            <ShieldCheck className="h-4 w-4" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-emerald-300">{verifiedCount}</p>
        </div>

        <div className="rounded-2xl border border-sky-500/20 bg-sky-500/[0.03] p-4">
          <div className="flex items-center justify-between text-sky-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active</span>
            <UserCheck className="h-4 w-4" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-sky-300">{activeCount}</p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] p-4">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Review</span>
            <Clock className="h-4 w-4" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-amber-300">{pendingCount}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
          <input
            type="text"
            placeholder="Search by name, ID number, phone, email, district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-xs text-white placeholder-ink-500 focus:border-gold-500/60 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs">
            <Filter className="h-3.5 w-3.5 text-ink-400" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-transparent text-xs text-white outline-none"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r} className="bg-ink-900 text-white">
                  {r === "All" ? "All Regions" : r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs text-white outline-none"
            >
              <option value="All" className="bg-ink-900 text-white">All Statuses</option>
              <option value="verified" className="bg-ink-900 text-white">Verified</option>
              <option value="active" className="bg-ink-900 text-white">Active</option>
              <option value="pending" className="bg-ink-900 text-white">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-ink-400 font-semibold uppercase tracking-wider">
                <th className="px-5 py-3.5">Member ID</th>
                <th className="px-5 py-3.5">Full Name</th>
                <th className="px-5 py-3.5">Contact</th>
                <th className="px-5 py-3.5">Location</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Joined</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-ink-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-500">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-gold-400" />
                    <p className="mt-2 font-medium">Loading member records...</p>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-500">
                    <Users className="mx-auto h-8 w-8 text-ink-600" />
                    <p className="mt-2 font-semibold">No members match the current filter.</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-4 font-mono font-bold text-gold-300">
                      {m.membershipNumber}
                    </td>
                    <td className="px-5 py-4 font-semibold text-white">
                      {m.fullName}
                      <span className="block text-[0.7rem] text-ink-400 font-normal">
                        {m.gender}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div>{m.phone}</div>
                      {m.email && <div className="text-[0.7rem] text-ink-400">{m.email}</div>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-white">{m.region}</span>
                      {m.district && (
                        <span className="block text-[0.7rem] text-ink-400">{m.district}</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider",
                          m.status === "verified" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                          m.status === "active" && "bg-sky-500/10 text-sky-400 border border-sky-500/20",
                          m.status === "pending" && "bg-amber-500/10 text-amber-400 border border-amber-500/20",
                        )}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-ink-400">
                      {formatDate(m.joinedAt, "en")}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {m.status !== "verified" && (
                          <button
                            onClick={() => updateStatus(m.id, "verified")}
                            title="Verify Member"
                            className="rounded-lg p-1.5 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteMember(m.id)}
                          title="Delete Member"
                          className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-white/12 bg-ink-900 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/8">
                <h3 className="font-display text-lg font-bold text-white">Register New Member</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-full p-1 text-ink-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddMember} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-300 mb-1">
                    Full Name (Magaca oo Dhammaystiran) *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Axmed Cali Maxamed"
                    className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-gold-500/70"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-ink-300 mb-1">
                      Phone (Telefoon) *
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+252 61..."
                      className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-gold-500/70"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-300 mb-1">
                      Gender (Jinsiga)
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="h-10 w-full rounded-xl border border-white/10 bg-ink-800 px-3 text-xs text-white outline-none"
                    >
                      <option value="Male">Male / Lab</option>
                      <option value="Female">Female / Dheddig</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-gold-500/70"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-ink-300 mb-1">
                      Region (Gobolka)
                    </label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="h-10 w-full rounded-xl border border-white/10 bg-ink-800 px-3 text-xs text-white outline-none"
                    >
                      {REGIONS.filter((r) => r !== "All").map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-300 mb-1">
                      District (Degmada)
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Hodan"
                      className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-gold-500/70"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-white/8">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="h-9 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-ink-300 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    className="h-9 rounded-xl bg-gold-gradient px-4 text-xs font-bold text-ink-950 shadow-gold"
                  >
                    {busy ? "Saving..." : "Save Member"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
