"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, Bell, AlertTriangle, CheckCircle2, Loader2, Palette } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "profile",    label: "Profile",       icon: User },
  { id: "security",   label: "Security",      icon: Lock },
  { id: "appearance", label: "Appearance",    icon: Palette },
  { id: "notifs",     label: "Notifications", icon: Bell },
  { id: "danger",     label: "Account",       icon: AlertTriangle },
] as const;

type TabId = typeof TABS[number]["id"];

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid md:grid-cols-3 gap-2 md:gap-4 items-start py-4 border-b border-border-subtle last:border-0">
      <label className="text-sm font-medium text-text-secondary pt-2">{label}</label>
      <div className="md:col-span-2">{children}</div>
    </div>
  );
}

function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-bg-elevated border border-border-subtle text-text-primary placeholder:text-text-muted rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand/20 focus:border-border-medium transition-colors ${className}`}
    />
  );
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={3}
      className="w-full bg-bg-elevated border border-border-subtle text-text-primary placeholder:text-text-muted rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand/20 focus:border-border-medium transition-colors resize-none"
    />
  );
}

function SaveButton({ loading, success }: { loading: boolean; success: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex items-center gap-2 px-5 py-2 bg-brand text-black text-sm font-semibold rounded-lg hover:bg-brand-hover disabled:opacity-50 transition-colors"
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
        <p className="text-xs text-text-muted mt-1">{form.bio.length}/300</p>
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

// ── Appearance tab ────────────────────────────────────────────────────────────

function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 w-32 bg-bg-elevated rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-28 bg-bg-elevated rounded-xl" />
          <div className="h-28 bg-bg-elevated rounded-xl" />
          <div className="h-28 bg-bg-elevated rounded-xl" />
        </div>
      </div>
    );
  }

  const options = [
    {
      id: "light",
      label: "Light",
      desc: "Clean light layout",
      preview: (
        <div className="w-full h-12 bg-white border border-zinc-200 rounded flex gap-1 p-1">
          <div className="w-3 h-full bg-zinc-100 rounded-sm" />
          <div className="flex-1 flex flex-col gap-1">
            <div className="h-2 bg-zinc-200 rounded-sm w-1/2" />
            <div className="h-2 bg-zinc-100 rounded-sm w-3/4" />
          </div>
        </div>
      ),
    },
    {
      id: "dark",
      label: "Dark",
      desc: "Sleek dark layout",
      preview: (
        <div className="w-full h-12 bg-zinc-950 border border-zinc-800 rounded flex gap-1 p-1">
          <div className="w-3 h-full bg-zinc-900 rounded-sm" />
          <div className="flex-1 flex flex-col gap-1">
            <div className="h-2 bg-zinc-800 rounded-sm w-1/2" />
            <div className="h-2 bg-zinc-900 rounded-sm w-3/4" />
          </div>
        </div>
      ),
    },
    {
      id: "system",
      label: "System",
      desc: "Matches OS settings",
      preview: (
        <div className="w-full h-12 rounded flex overflow-hidden border border-border-subtle">
          <div className="w-1/2 h-full bg-white flex gap-1 p-1">
            <div className="w-2 h-full bg-zinc-100 rounded-sm" />
            <div className="h-2 bg-zinc-200 rounded-sm w-full" />
          </div>
          <div className="w-1/2 h-full bg-zinc-950 flex gap-1 p-1">
            <div className="w-2 h-full bg-zinc-900 rounded-sm" />
            <div className="h-2 bg-zinc-800 rounded-sm w-full" />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-1">Theme</h3>
        <p className="text-xs text-text-secondary">Choose how AXIOM looks to you.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {options.map((opt) => {
          const active = theme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              className={cn(
                "flex flex-col gap-3 p-4 rounded-xl border text-left transition-all duration-200 hover:border-border-medium cursor-pointer group",
                active
                  ? "border-brand bg-brand/5 shadow-[0_0_0_1px_var(--brand)]"
                  : "border-border-subtle bg-bg-card"
              )}
            >
              {opt.preview}
              <div>
                <div className="text-xs font-semibold text-text-primary flex items-center justify-between">
                  {opt.label}
                  <div className={cn(
                    "w-3 h-3 rounded-full border flex items-center justify-center shrink-0",
                    active ? "border-brand bg-brand" : "border-border-medium"
                  )}>
                    {active && <div className="w-1 h-1 bg-black rounded-full" />}
                  </div>
                </div>
                <div className="text-[10px] text-text-secondary mt-0.5">{opt.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Notifications tab ─────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-brand" : "bg-bg-hover border border-border-subtle"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full transition-transform ${checked ? "translate-x-5 bg-black" : "bg-text-muted"}`} />
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
        <div key={field} className="flex items-center justify-between py-4 border-b border-border-subtle last:border-0">
          <div>
            <p className="text-sm font-medium text-text-primary">{label}</p>
            <p className="text-xs text-text-muted mt-0.5">{desc}</p>
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
      <div className="rounded-xl border border-border-subtle p-5 bg-bg-card">
        <h3 className="text-sm font-semibold text-text-primary mb-1">Export your data</h3>
        <p className="text-xs text-text-secondary mb-4">Download a JSON copy of all your AXIOM data.</p>
        <a
          href="/api/users/me/export"
          download="axiom-data-export.json"
          className="inline-flex items-center px-4 py-2 bg-bg-elevated hover:bg-bg-hover text-text-primary text-sm font-medium rounded-lg border border-border-subtle transition-colors"
        >
          Download data export
        </a>
      </div>
      <div className="rounded-xl border border-red-950/40 bg-red-950/5 p-5">
        <h3 className="text-sm font-semibold text-red-400 mb-1">Delete account</h3>
        <p className="text-xs text-text-secondary mb-4">
          Permanently deletes your account and all associated data. This cannot be undone.
        </p>
        <p className="text-xs text-text-secondary mb-2">
          Type <span className="font-mono text-text-primary">delete my account</span> to confirm:
        </p>
        <input
          value={confirm}
          onChange={(e) => { setConfirm(e.target.value); setError(""); }}
          placeholder="delete my account"
          className="w-full bg-bg-elevated border border-border-subtle text-text-primary placeholder:text-text-muted rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500/40 focus:border-red-700 transition-colors mb-3"
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
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your profile, security, and preferences.</p>
      </div>

      {!isLoading && (
        <div className="mb-6 flex items-center gap-3">
          <div className="flex-1 h-1 rounded-full bg-bg-elevated overflow-hidden">
            <div className="h-full bg-brand rounded-full transition-all duration-500" style={{ width: `${completionPct}%` }} />
          </div>
          <span className="text-xs text-text-secondary shrink-0">Profile {completionPct}% complete</span>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border-subtle mb-6 overflow-x-auto scrollbar-none">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              activeTab === id
                ? "border-brand text-text-primary"
                : "border-transparent text-text-muted hover:text-text-secondary"
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
          {activeTab === "appearance" && <AppearanceTab />}
          {activeTab === "notifs"   && <NotificationsTab />}
          {activeTab === "danger"   && <DangerTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
