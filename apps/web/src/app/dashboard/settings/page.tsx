"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, Bell, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const TABS = [
  { id: "profile",  label: "Profile",       icon: User },
  { id: "security", label: "Security",      icon: Lock },
  { id: "notifs",   label: "Notifications", icon: Bell },
  { id: "danger",   label: "Account",       icon: AlertTriangle },
] as const;

type TabId = typeof TABS[number]["id"];

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid md:grid-cols-3 gap-2 md:gap-4 items-start py-4 border-b border-zinc-800/60 last:border-0">
      <label className="text-sm font-medium text-zinc-300 pt-2">{label}</label>
      <div className="md:col-span-2">{children}</div>
    </div>
  );
}

function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-zinc-500 transition-colors ${className}`}
    />
  );
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={3}
      className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-zinc-500 transition-colors resize-none"
    />
  );
}

function SaveButton({ loading, success }: { loading: boolean; success: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex items-center gap-2 px-5 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-zinc-200 disabled:opacity-50 transition-colors"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : success ? <CheckCircle2 size={14} /> : null}
      {loading ? "Saving…" : success ? "Saved" : "Save changes"}
    </button>
  );
}

// ── Profile tab ───────────────────────────────────────────────────────────────

function ProfileTab() {
  const { profile, updateProfile } = useProfile();
  const [form, setForm] = useState({
    name:         profile?.name            ?? "",
    bio:          profile?.bio             ?? "",
    location:     profile?.location        ?? "",
    currentTitle: profile?.currentTitle    ?? "",
    yearsOfExp:   String(profile?.yearsOfExperience ?? ""),
    linkedinUrl:  profile?.linkedinUrl     ?? "",
    githubUrl:    profile?.githubUrl       ?? "",
    portfolioUrl: profile?.portfolioUrl    ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  const set = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setSuccess(false);
    };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await updateProfile({
        ...form,
        yearsOfExperience: form.yearsOfExp ? Number(form.yearsOfExp) : undefined,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldRow label="Display name">
        <Input value={form.name} onChange={set("name")} placeholder="Your full name" />
      </FieldRow>
      <FieldRow label="Professional title">
        <Input value={form.currentTitle} onChange={set("currentTitle")} placeholder="e.g. Senior Software Engineer" />
      </FieldRow>
      <FieldRow label="Bio">
        <Textarea value={form.bio} onChange={set("bio")} placeholder="A short bio about yourself…" />
        <p className="text-xs text-zinc-500 mt-1">{form.bio.length}/300</p>
      </FieldRow>
      <FieldRow label="Location">
        <Input value={form.location} onChange={set("location")} placeholder="e.g. San Francisco, CA" />
      </FieldRow>
      <FieldRow label="Years of experience">
        <Input type="number" min={0} max={50} value={form.yearsOfExp} onChange={set("yearsOfExp")} placeholder="0" className="w-24" />
      </FieldRow>
      <FieldRow label="LinkedIn">
        <Input value={form.linkedinUrl} onChange={set("linkedinUrl")} placeholder="https://linkedin.com/in/…" />
      </FieldRow>
      <FieldRow label="GitHub">
        <Input value={form.githubUrl} onChange={set("githubUrl")} placeholder="https://github.com/…" />
      </FieldRow>
      <FieldRow label="Portfolio">
        <Input value={form.portfolioUrl} onChange={set("portfolioUrl")} placeholder="https://yoursite.com" />
      </FieldRow>
      {error && <p className="text-sm text-red-400 pt-2">{error}</p>}
      <div className="pt-4"><SaveButton loading={loading} success={success} /></div>
    </form>
  );
}

// ── Security tab ──────────────────────────────────────────────────────────────

function SecurityTab() {
  const { changePassword } = useProfile();
  const [form, setForm]   = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  const set = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setError("");
    };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) { setError("New passwords do not match"); return; }
    setLoading(true);
    try {
      await changePassword(form.currentPassword, form.newPassword);
      setSuccess(true);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Incorrect current password or password requirements not met.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldRow label="Current password">
        <Input type="password" value={form.currentPassword} onChange={set("currentPassword")} placeholder="Enter current password" />
      </FieldRow>
      <FieldRow label="New password">
        <Input type="password" value={form.newPassword} onChange={set("newPassword")} placeholder="Min 8 chars, uppercase, number, symbol" />
      </FieldRow>
      <FieldRow label="Confirm new password">
        <Input type="password" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Repeat new password" />
      </FieldRow>
      {error && <p className="text-sm text-red-400 pt-2">{error}</p>}
      <div className="pt-4"><SaveButton loading={loading} success={success} /></div>
    </form>
  );
}

// ── Notifications tab ─────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-white" : "bg-zinc-700"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform ${checked ? "translate-x-5 bg-black" : "bg-zinc-400"}`} />
    </button>
  );
}

function NotificationsTab() {
  const { prefs, updatePreferences } = useProfile();
  const [form, setForm] = useState({
    emailNotifications: prefs?.emailNotifications ?? true,
    jobAlerts:          prefs?.jobAlerts          ?? true,
    weeklyDigest:       prefs?.weeklyDigest       ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggle = (field: keyof typeof form) => (v: boolean) => {
    setForm((f) => ({ ...f, [field]: v }));
    setSuccess(false);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updatePreferences(form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setLoading(false);
    }
  }

  const rows: [keyof typeof form, string, string][] = [
    ["emailNotifications", "Email notifications",  "Receive important account updates via email"],
    ["jobAlerts",          "Job alerts",           "Get notified about new matching job postings"],
    ["weeklyDigest",       "Weekly digest",        "A weekly summary of your career progress"],
  ];

  return (
    <form onSubmit={handleSubmit}>
      {rows.map(([field, label, desc]) => (
        <div key={field} className="flex items-center justify-between py-4 border-b border-zinc-800/60 last:border-0">
          <div>
            <p className="text-sm font-medium text-white">{label}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
          </div>
          <Toggle checked={form[field]} onChange={toggle(field)} />
        </div>
      ))}
      <div className="pt-4"><SaveButton loading={loading} success={success} /></div>
    </form>
  );
}

// ── Danger zone tab ───────────────────────────────────────────────────────────

function DangerTab() {
  const { deleteAccount } = useProfile();
  const { logout }        = useAuth();
  const router            = useRouter();
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handleDelete() {
    if (confirm !== "delete my account") { setError("Please type the confirmation phrase exactly."); return; }
    setLoading(true);
    try {
      await deleteAccount();
      logout();
      router.push("/");
    } catch {
      setError("Failed to delete account. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Export your data</h3>
        <p className="text-xs text-zinc-500 mb-4">Download a JSON copy of all your AXIOM data.</p>
        <a
          href="/api/users/me/export"
          download="axiom-data-export.json"
          className="inline-flex items-center px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Download data export
        </a>
      </div>
      <div className="rounded-xl border border-red-900/40 bg-red-950/10 p-5">
        <h3 className="text-sm font-semibold text-red-400 mb-1">Delete account</h3>
        <p className="text-xs text-zinc-500 mb-4">
          Permanently deletes your account and all associated data. This cannot be undone.
        </p>
        <p className="text-xs text-zinc-400 mb-2">
          Type <span className="font-mono text-zinc-300">delete my account</span> to confirm:
        </p>
        <input
          value={confirm}
          onChange={(e) => { setConfirm(e.target.value); setError(""); }}
          placeholder="delete my account"
          className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500/40 focus:border-red-700 transition-colors mb-3"
        />
        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {loading && <Loader2 size={13} className="animate-spin" />}
          Delete account permanently
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab]  = useState<TabId>("profile");
  const { profile, isLoading }     = useProfile();
  const completionPct              = profile?.profileCompletionPct ?? 0;

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-zinc-400 mt-1">Manage your profile, security, and preferences.</p>
      </div>

      {!isLoading && (
        <div className="mb-6 flex items-center gap-3">
          <div className="flex-1 h-1 rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${completionPct}%` }} />
          </div>
          <span className="text-xs text-zinc-500 shrink-0">Profile {completionPct}% complete</span>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-zinc-800 mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === id
                ? "border-white text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === "profile"  && <ProfileTab />}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "notifs"   && <NotificationsTab />}
          {activeTab === "danger"   && <DangerTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
