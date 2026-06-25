import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
  rounded?: "full" | "xl";
}

export function UserAvatar({
  name,
  email,
  avatarUrl,
  size = 32,
  className,
  rounded = "full",
}: UserAvatarProps) {
  const initial = (name?.charAt(0) ?? email?.charAt(0) ?? "?").toUpperCase();
  const radius = rounded === "xl" ? "rounded-2xl" : "rounded-full";

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name ?? "User avatar"}
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        className={cn(
          "object-cover shrink-0 bg-bg-elevated border border-border-subtle",
          radius,
          className,
        )}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={cn(
        "bg-bg-elevated border border-border-subtle flex items-center justify-center shrink-0",
        radius,
        className,
      )}
      style={{ width: size, height: size }}
    >
      <span
        className="font-semibold text-text-primary uppercase"
        style={{ fontSize: Math.max(10, Math.round(size * 0.38)) }}
      >
        {initial}
      </span>
    </div>
  );
}
