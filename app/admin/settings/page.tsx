"use client";

import { useEffect, useState } from "react";

interface StaffMember {
  id: string;
  full_name: string | null;
  email: string | null;
  role: "admin" | "staff";
  created_at: string;
}

export default function SettingsPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"staff" | "admin">("staff");

  async function fetchStaff() {
    const res = await fetch("/api/admin/staff");
    if (res.ok) setStaff(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchStaff(); }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, full_name: name, role }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
    } else {
      setSuccess(`Invite sent to ${email}`);
      setName("");
      setEmail("");
      setRole("staff");
      fetchStaff();
    }
    setSubmitting(false);
  }

  async function handleRoleChange(id: string, newRole: "admin" | "staff") {
    await fetch("/api/admin/staff", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role: newRole }),
    });
    fetchStaff();
  }

  async function handleRemove(id: string, memberName: string | null) {
    if (!confirm(`Remove ${memberName ?? "this user"}'s staff access?`)) return;
    const res = await fetch("/api/admin/staff", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to remove user");
    } else {
      fetchStaff();
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 h-16 border-b border-border flex items-center px-8">
        <h1 className="text-lg font-serif">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8 max-w-2xl space-y-10">

        {/* Invite form */}
        <section>
          <h2 className="text-sm font-medium text-foreground mb-1">Add Staff Member</h2>
          <p className="text-xs text-foreground-muted mb-5">
            They'll receive an email invite to set up their account.
          </p>

          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-foreground-muted uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Jane Smith"
                  className="w-full px-3 py-2 text-sm bg-card border border-border focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-foreground-muted uppercase tracking-widest">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="jane@example.com"
                  className="w-full px-3 py-2 text-sm bg-card border border-border focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-foreground-muted uppercase tracking-widest">Role</label>
              <div className="flex gap-3">
                {(["staff", "admin"] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`px-4 py-2 text-sm border transition-colors capitalize ${
                      role === r
                        ? "border-primary text-primary bg-primary/5"
                        : "border-border text-foreground-muted hover:border-foreground-muted"
                    }`}
                  >
                    {r === "staff" ? "Staff — orders only" : "Admin — full access"}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-primary text-background text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {submitting ? "Sending invite…" : "Send Invite"}
            </button>
          </form>
        </section>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Staff list */}
        <section>
          <h2 className="text-sm font-medium text-foreground mb-5">Current Staff</h2>

          {loading ? (
            <p className="text-sm text-foreground-muted">Loading…</p>
          ) : staff.length === 0 ? (
            <p className="text-sm text-foreground-muted">No staff members yet.</p>
          ) : (
            <div className="divide-y divide-border border border-border">
              {staff.map(member => (
                <div key={member.id} className="flex items-center gap-4 px-5 py-4">
                  {/* Avatar initial */}
                  <div className="w-8 h-8 bg-background-secondary border border-border flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-foreground-muted">
                      {(member.full_name ?? member.email ?? "?")[0].toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.full_name ?? "—"}</p>
                    <p className="text-xs text-foreground-muted truncate">{member.email}</p>
                  </div>

                  {/* Role selector */}
                  <select
                    value={member.role}
                    onChange={e => handleRoleChange(member.id, e.target.value as "admin" | "staff")}
                    className="text-xs border border-border bg-card px-2 py-1.5 focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(member.id, member.full_name)}
                    className="text-xs text-foreground-muted hover:text-red-500 transition-colors px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
