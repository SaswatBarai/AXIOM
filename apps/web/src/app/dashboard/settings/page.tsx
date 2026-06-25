"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Lock,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Palette,
  Sparkles,
  ChevronRight,
  Shield,
  Download,
} from "lucide-react";
import { SettingsPageSkeleton } from "@/components/dashboard/SettingsSkeleton";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TabId = "profile" | "security" | "appearance" | "notifs" | "danger";

type TabItem = {
  id: TabId;
  label: string;
  desc: string;
  icon: typeof User;
  danger?: boolean;
};

const TABS: TabItem[] = [
  {
    id: "profile",
    label: "Profile",
    desc: "Name, bio, and professional links",
    icon: User,
  },
  {
    id: "security",
    label: "Security",
    desc: "Password and authentication",
    icon: Lock,
  },
  {
    id: "appearance",
    label: "Appearance",
    desc: "Theme and display preferences",
    icon: Palette,
  },
  {
    id: "notifs",
    label: "Notifications",
    desc: "Email alerts and digests",
    icon: Bell,
  },
  {
    id: "danger",
    label: "Account",
    desc: "Export data or delete account",
    icon: AlertTriangle,
    danger: true,
  },
];

const CIRC = 2 * Math.PI * 40;

function PageBackground() {
  return (
    <>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(var(--grid-dot-color) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(ellipse 80% 50% at 50% 0%, #000 50%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 50% at 50% 0%, #000 50%, transparent 100%)",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[560px] h-[220px] bg-brand/[0.06] rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[280px] h-[180px] bg-emerald-500/[0.03] rounded-full blur-[90px] pointer-events-none" />
    </>
  );
}

function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl group", className)}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
        style={{
          background: `radial-gradient(320px circle at ${pos.x}px ${pos.y}px, var(--spotlight-color), transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
}

function CompletionRing({ pct }: { pct: number }) {
  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg-elevated)" strokeWidth="6" />
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#f97316"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          initial={{ strokeDashoffset: CIRC }}
          animate={{ strokeDashoffset: CIRC * (1 - pct / 100) }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-text-primary tabular-nums">{pct}%</span>
      </div>
    </div>
  );
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid md:grid-cols-3 gap-2 md:gap-6 items-start py-4 border-b border-border-subtle/80 last:border-0">
      <div className="pt-2">
        <label className="text-sm font-medium text-text-primary">{label}</label>
        {hint && <p className="text-[11px] text-text-muted mt-0.5">{hint}</p>}
      </div>
      <div className="md:col-span-2">{children}</div>
    </div>
  );
}

function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full bg-bg-base/60 border border-border-subtle text-text-primary placeholder:text-text-muted",
        "rounded-xl px-3.5 py-2.5 text-sm backdrop-blur-sm",
        "focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all duration-200",
        className,
      )}
    />
  );
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={3}
      className="w-full bg-bg-base/60 border border-border-subtle text-text-primary placeholder:text-text-muted rounded-xl px-3.5 py-2.5 text-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all duration-200 resize-none"
    />
  );
}

function SaveButton({ loading, success }: { loading: boolean; success: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand text-black text-sm font-semibold rounded-xl hover:bg-brand-hover disabled:opacity-50 transition-all duration-200 shadow-lg shadow-brand/10"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : success ? <CheckCircle2 size={14} /> : null}
      {loading ? "Saving…" : success ? "Saved" : "Save changes"}
    </button>
  );
}

function ProfileTab() {
  const { profile, updateProfile } = useProfile();
  const [form, setForm] = useState({
    name: "",
    bio: "",
    location: "",
    currentTitle: "",
    yearsOfExp: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile) return;
    setForm({
      name: profile.name ?? "",
      bio: profile.bio ?? "",
      location: profile.location ?? "",
      currentTitle: profile.currentTitle ?? "",
      yearsOfExp: String(profile.yearsOfExperience ?? ""),
      linkedinUrl: profile.linkedinUrl ?? "",
      githubUrl: profile.githubUrl ?? "",
      portfolioUrl: profile.portfolioUrl ?? "",
    });
  }, [profile]);

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
      <FieldRow label="Professional title" hint="Shown on your dashboard and applications">
        <Input value={form.currentTitle} onChange={set("currentTitle")} placeholder="e.g. Senior Software Engineer" />
      </FieldRow>
      <FieldRow label="Bio">
        <Textarea value={form.bio} onChange={set("bio")} placeholder="A short bio about yourself…" maxLength={300} />
        <p className="text-xs text-text-muted mt-1.5">{form.bio.length}/300</p>
      </FieldRow>
      <FieldRow label="Location">
        <Input value={form.location} onChange={set("location")} placeholder="e.g. Bangalore, India" />
      </FieldRow>
      <FieldRow label="Years of experience">
        <Input type="number" min={0} max={50} value={form.yearsOfExp} onChange={set("yearsOfExp")} placeholder="0" className="w-28" />
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
      <div className="pt-6 flex justify-end">
        <SaveButton loading={loading} success={success} />
      </div>
    </form>
  );
}

function SecurityTab() {
  const { changePassword } = useProfile();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setError("");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
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
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-border-subtle bg-bg-base/40 p-4">
        <div className="w-9 h-9 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
          <Shield size={16} className="text-brand" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">Keep your account secure</p>
          <p className="text-xs text-text-secondary mt-0.5">
            Use a strong password with at least 8 characters, including uppercase, a number, and a symbol.
          </p>
        </div>
      </div>
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
      <div className="pt-6 flex justify-end">
        <SaveButton loading={loading} success={success} />
      </div>
    </form>
  );
}

function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-36 rounded-2xl bg-bg-elevated" />
        ))}
      </div>
    );
  }

  const options = [
    {
      id: "light",
      label: "Light",
      desc: "Clean, bright interface",
      preview: (
        <div className="w-full h-14 bg-white border border-zinc-200 rounded-lg flex gap-1.5 p-1.5 shadow-inner">
          <div className="w-4 h-full bg-zinc-100 rounded" />
          <div className="flex-1 flex flex-col gap-1 justify-center">
            <div className="h-2 bg-zinc-200 rounded w-1/2" />
            <div className="h-2 bg-zinc-100 rounded w-3/4" />
          </div>
        </div>
      ),
    },
    {
      id: "dark",
      label: "Dark",
      desc: "Sleek dark interface",
      preview: (
        <div className="w-full h-14 bg-zinc-950 border border-zinc-800 rounded-lg flex gap-1.5 p-1.5 shadow-inner">
          <div className="w-4 h-full bg-zinc-900 rounded" />
          <div className="flex-1 flex flex-col gap-1 justify-center">
            <div className="h-2 bg-zinc-700 rounded w-1/2" />
            <div className="h-2 bg-zinc-800 rounded w-3/4" />
          </div>
        </div>
      ),
    },
    {
      id: "system",
      label: "System",
      desc: "Matches your OS",
      preview: (
        <div className="w-full h-14 rounded-lg flex overflow-hidden border border-border-subtle shadow-inner">
          <div className="w-1/2 h-full bg-white flex gap-1 p-1.5">
            <div className="w-3 h-full bg-zinc-100 rounded" />
            <div className="h-2 bg-zinc-200 rounded w-full self-center" />
          </div>
          <div className="w-1/2 h-full bg-zinc-950 flex gap-1 p-1.5">
            <div className="w-3 h-full bg-zinc-900 rounded" />
            <div className="h-2 bg-zinc-700 rounded w-full self-center" />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {options.map((opt) => {
        const active = theme === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            className={cn(
              "flex flex-col gap-4 p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer group",
              active
                ? "border-brand/60 bg-brand/5 shadow-[0_0_0_1px_rgba(249,115,22,0.3)]"
                : "border-border-subtle bg-bg-base/40 hover:border-border-medium hover:bg-bg-hover/30",
            )}
          >
            {opt.preview}
            <div>
              <div className="text-sm font-semibold text-text-primary flex items-center justify-between">
                {opt.label}
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                    active ? "border-brand bg-brand" : "border-border-medium group-hover:border-border-strong",
                  )}
                >
                  {active && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                </div>
              </div>
              <p className="text-xs text-text-secondary mt-1">{opt.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0",
        checked ? "bg-brand" : "bg-bg-hover border border-border-subtle",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-200 shadow-sm",
          checked ? "translate-x-5 bg-black" : "bg-text-muted",
        )}
      />
    </button>
  );
}

function NotificationsTab() {
  const { prefs, updatePreferences } = useProfile();
  const [form, setForm] = useState({
    emailNotifications: true,
    jobAlerts: true,
    weeklyDigest: true,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!prefs) return;
    setForm({
      emailNotifications: prefs.emailNotifications ?? true,
      jobAlerts: prefs.jobAlerts ?? true,
      weeklyDigest: prefs.weeklyDigest ?? true,
    });
  }, [prefs]);

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
    ["emailNotifications", "Email notifications", "Important account updates and security alerts"],
    ["jobAlerts", "Job alerts", "New matching opportunities as they're discovered"],
    ["weeklyDigest", "Weekly digest", "A summary of your career progress each week"],
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-1">
        {rows.map(([field, label, desc]) => (
          <div
            key={field}
            className="flex items-center justify-between gap-4 py-4 px-1 border-b border-border-subtle/80 last:border-0 rounded-lg hover:bg-bg-hover/20 transition-colors"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary">{label}</p>
              <p className="text-xs text-text-muted mt-0.5">{desc}</p>
            </div>
            <Toggle checked={form[field]} onChange={toggle(field)} />
          </div>
        ))}
      </div>
      <div className="pt-6 flex justify-end">
        <SaveButton loading={loading} success={success} />
      </div>
    </form>
  );
}

function DangerTab() {
  const { deleteAccount } = useProfile();
  const { logout } = useAuth();
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (confirm !== "delete my account") {
      setError("Please type the confirmation phrase exactly.");
      return;
    }
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
    <div className="space-y-5">
      <Card className="border border-border-subtle bg-bg-base/40 backdrop-blur-sm rounded-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-bg-elevated border border-border-subtle flex items-center justify-center shrink-0">
              <Download size={18} className="text-text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-text-primary">Export your data</h3>
              <p className="text-xs text-text-secondary mt-1 mb-4">
                Download a JSON copy of all your AXIOM data — resumes, applications, and preferences.
              </p>
              <a
                href="/api/users/me/export"
                download="axiom-data-export.json"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-bg-elevated hover:bg-bg-hover text-text-primary text-sm font-medium rounded-xl border border-border-subtle transition-all duration-200"
              >
                <Download size={14} />
                Download data export
              </a>
            </div>
          </div>
        </div>
      </Card>

      <Card className="border border-red-500/20 bg-red-500/[0.03] backdrop-blur-sm rounded-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-red-400">Delete account</h3>
              <p className="text-xs text-text-secondary mt-1 mb-4">
                Permanently removes your account and all associated data. This action cannot be undone.
              </p>
              <p className="text-xs text-text-secondary mb-2">
                Type <span className="font-mono text-text-primary bg-bg-elevated px-1.5 py-0.5 rounded">delete my account</span> to confirm:
              </p>
              <Input
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setError("");
                }}
                placeholder="delete my account"
                className="mb-3 focus:ring-red-500/20 focus:border-red-500/40"
              />
              {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {loading && <Loader2 size={13} className="animate-spin" />}
                Delete account permanently
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

const TAB_CONTENT: Record<TabId, React.ComponentType> = {
  profile: ProfileTab,
  security: SecurityTab,
  appearance: AppearanceTab,
  notifs: NotificationsTab,
  danger: DangerTab,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const { profile, isLoading } = useProfile();
  const { user } = useAuth();
  const completionPct = profile?.profileCompletionPct ?? 0;
  const activeMeta = TABS.find((t) => t.id === activeTab)!;
  const ActiveContent = TAB_CONTENT[activeTab];

  const displayName = profile?.name ?? user?.name ?? "User";
  const displayEmail = profile?.email ?? user?.email ?? "";
  const initial = displayName.charAt(0).toUpperCase();

  if (isLoading) {
    return <SettingsPageSkeleton />;
  }

  return (
    <div className="relative min-h-full overflow-hidden">
      <PageBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-12">
        {/* Hero header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <Badge
            variant="outline"
            className="mb-4 border-border-subtle bg-bg-card/60 text-text-secondary backdrop-blur-sm gap-1.5 px-3 py-1"
          >
            <Sparkles size={12} className="text-brand" />
            Account preferences
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
            Your{" "}
            <span className="text-brand" style={{ textShadow: "0 0 60px rgba(249,115,22,0.25)" }}>
              Settings
            </span>
          </h1>
          <p className="text-sm text-text-secondary mt-2 max-w-lg">
            Manage your profile, security, and how AXIOM works for you.
          </p>
        </motion.div>

        {/* Profile summary card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06 }}
        >
          <Card className="mb-8 border border-border-subtle bg-bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg">
              <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/20 flex items-center justify-center shrink-0 shadow-inner">
                  <span className="text-2xl font-bold text-brand">{initial}</span>
                </div>
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <p className="text-lg font-bold text-text-primary truncate">{displayName}</p>
                  <p className="text-sm text-text-secondary truncate">{displayEmail}</p>
                  {profile?.currentTitle && (
                    <p className="text-xs text-text-muted mt-0.5 truncate">{profile.currentTitle}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <CompletionRing pct={completionPct} />
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-text-primary">Profile strength</p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {completionPct < 100 ? "Complete your profile for better matches" : "Profile complete"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

        {/* Main layout */}
        <div className="grid lg:grid-cols-[260px_1fr] gap-6 items-start">
          {/* Side navigation */}
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 scrollbar-none">
            {TABS.map(({ id, label, desc, icon: Icon, danger }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all duration-200 shrink-0 lg:shrink lg:w-full group",
                    active
                      ? danger
                        ? "border-red-500/30 bg-red-500/[0.06] shadow-sm"
                        : "border-brand/40 bg-brand/5 shadow-[0_0_0_1px_rgba(249,115,22,0.15)]"
                      : "border-border-subtle bg-bg-card/30 hover:border-border-medium hover:bg-bg-hover/40",
                  )}
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                      active
                        ? danger
                          ? "bg-red-500/10 text-red-400"
                          : "bg-brand/15 text-brand"
                        : "bg-bg-elevated text-text-muted group-hover:text-text-secondary",
                    )}
                  >
                    <Icon size={16} strokeWidth={active ? 2 : 1.75} />
                  </div>
                  <div className="min-w-0 flex-1 hidden sm:block lg:block">
                    <p
                      className={cn(
                        "text-sm font-semibold truncate",
                        active ? (danger ? "text-red-400" : "text-text-primary") : "text-text-secondary",
                      )}
                    >
                      {label}
                    </p>
                    <p className="text-[11px] text-text-muted truncate hidden lg:block">{desc}</p>
                  </div>
                  {active && (
                    <ChevronRight size={14} className="text-text-muted shrink-0 hidden lg:block" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Content panel */}
          <SpotlightCard>
            <Card className="border border-border-subtle bg-bg-card/40 backdrop-blur-md rounded-2xl shadow-lg relative z-[1]">
              <div className="p-6 sm:p-8 border-b border-border-subtle/80">
                <h2 className="text-xl font-bold text-text-primary tracking-tight">{activeMeta.label}</h2>
                <p className="text-sm text-text-secondary mt-1">{activeMeta.desc}</p>
              </div>
              <div className="p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ActiveContent />
                  </motion.div>
                </AnimatePresence>
              </div>
            </Card>
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
}
