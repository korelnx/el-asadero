"use client";

import { useState } from "react";

interface StaffMember {
  id: string;
  full_name: string;
  email: string;
  role: "admin" | "staff";
  created_at: string;
}

// Mock data for UI preview — replace with real Supabase fetch when ready
const MOCK_STAFF: StaffMember[] = [
  { id: "1", full_name: "Dev Admin", email: "admin@elasadero.com", role: "admin", created_at: "2024-01-01" },
];

export default function SettingsPage() {
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF);
  const [showSheet, setShowSheet] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 h-16 border-b border-border flex items-center justify-between px-8">
        <h1 className="text-lg font-serif">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10 max-w-3xl">

        {/* Staff Management */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-serif">Team Members</h2>
              <p className="text-xs text-foreground/50 mt-0.5">Manage who has access to the dashboard.</p>
            </div>
            <button
              onClick={() => setShowSheet(true)}
              className="flex items-center gap-1.5 text-xs px-4 py-2 bg-primary text-background hover:bg-primary-hover transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Member
            </button>
          </div>

          {/* Staff table */}
          <div className="border border-border divide-y divide-border">
            {staff.map(member => (
              <div key={member.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-primary">
                      {member.full_name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.full_name}</p>
                    <p className="text-xs text-foreground/50">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <RoleBadge role={member.role} />
                  {member.role !== "admin" && (
                    <button
                      onClick={() => setDeleteTarget(member)}
                      className="text-foreground/30 hover:text-red-400 transition-colors"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-foreground/30">
            Staff can view and update orders. Only admins can access revenue, menu management, and settings.
          </p>
        </section>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Roles reference */}
        <section className="space-y-4">
          <h2 className="text-base font-serif">Role Permissions</h2>
          <div className="border border-border divide-y divide-border">
            <PermissionRow label="View & manage orders" admin staff />
            <PermissionRow label="Mark items 86'd" admin staff />
            <PermissionRow label="View today's revenue" admin />
            <PermissionRow label="Menu management" admin />
            <PermissionRow label="Add / remove team members" admin />
            <PermissionRow label="Settings" admin />
          </div>
        </section>

      </div>

      {/* Add Member Sheet */}
      {showSheet && (
        <AddMemberSheet
          onAdd={(member) => {
            setStaff(prev => [...prev, { ...member, id: Date.now().toString(), created_at: new Date().toISOString() }]);
            setShowSheet(false);
          }}
          onClose={() => setShowSheet(false)}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-background border border-border w-full max-w-sm p-6 space-y-4">
            <p className="text-sm">Remove <span className="font-medium">{deleteTarget.full_name}</span>? They will lose dashboard access immediately.</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStaff(prev => prev.filter(s => s.id !== deleteTarget.id));
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/20 transition-colors"
              >
                Remove
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-border text-sm text-foreground/50 hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddMemberSheet({
  onAdd,
  onClose,
}: {
  onAdd: (member: Omit<StaffMember, "id" | "created_at">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ full_name: "", email: "", role: "staff" as "admin" | "staff" });
  const [error, setError] = useState("");

  const isDirty = form.full_name.trim() !== "" || form.email.trim() !== "";

  function tryClose() {
    onClose();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    onAdd(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={tryClose}
      />
      {/* Sheet */}
      <form
        onSubmit={submit}
        className="relative w-full max-w-sm bg-background border-l border-border shadow-2xl flex flex-col animate-sheet-in"
      >
        {/* Sheet header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-serif">New Team Member</h2>
            {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-primary" title="Unsaved changes" />}
          </div>
          <button type="button" onClick={tryClose} className="text-foreground-muted hover:text-foreground transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <Field label="Full Name" required>
            <input
              type="text"
              value={form.full_name}
              onChange={e => { setError(""); setForm(f => ({ ...f, full_name: e.target.value })); }}
              className="w-full bg-card border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="Jane Doe"
              autoFocus
            />
          </Field>

          <Field label="Email" required>
            <input
              type="email"
              value={form.email}
              onChange={e => { setError(""); setForm(f => ({ ...f, email: e.target.value })); }}
              className="w-full bg-card border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="jane@elasadero.com"
            />
          </Field>

          <Field label="Role">
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value as "admin" | "staff" }))}
              className="w-full bg-card border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
            >
              <option value="staff">Staff — orders only</option>
              <option value="admin">Admin — full access</option>
            </select>
          </Field>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <p className="text-xs text-foreground/30">
            When Supabase is connected, this will send an invite email and create their account automatically.
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-border flex gap-3">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center bg-primary text-background text-sm font-medium py-2.5 hover:bg-primary-hover transition-colors"
          >
            Add Member
          </button>
          <button
            type="button"
            onClick={tryClose}
            className="px-5 py-2.5 border border-border text-sm text-foreground-muted hover:text-foreground hover:border-foreground-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-foreground-muted uppercase tracking-widest mb-1.5">
        {label}{required && <span className="text-primary ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function RoleBadge({ role }: { role: "admin" | "staff" }) {
  return role === "admin"
    ? <span className="text-xs px-2 py-0.5 border border-accent/30 text-accent">Admin</span>
    : <span className="text-xs px-2 py-0.5 border border-border text-foreground/40">Staff</span>;
}

function PermissionRow({ label, admin, staff }: { label: string; admin?: boolean; staff?: boolean }) {
  return (
    <div className="flex items-center px-5 py-3 gap-8">
      <span className="flex-1 text-sm text-foreground/70">{label}</span>
      <div className="flex items-center gap-8 text-xs w-32">
        <span className="w-12 text-center">
          {admin
            ? <span className="text-primary">✓</span>
            : <span className="text-foreground/20">—</span>}
        </span>
        <span className="w-12 text-center">
          {staff
            ? <span className="text-primary">✓</span>
            : <span className="text-foreground/20">—</span>}
        </span>
      </div>
    </div>
  );
}
