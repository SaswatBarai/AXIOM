import { DashboardOverviewSkeleton } from "@/components/dashboard/DashboardOverviewSkeleton";
import { DashboardResumeSkeleton } from "@/components/dashboard/DashboardResumeSkeleton";
import { ApplicationPageSkeleton } from "@/components/dashboard/ApplicationsSkeleton";
import { SkillGapPageSkeleton } from "@/components/dashboard/SkillsSkeleton";
import { InterviewPageSkeleton } from "@/components/dashboard/InterviewSkeleton";
import { RoadmapPageSkeleton } from "@/components/dashboard/RoadmapSkeleton";
import { AnalyticsPageSkeleton } from "@/components/dashboard/AnalyticsSkeleton";
import { SettingsPageSkeleton } from "@/components/dashboard/SettingsSkeleton";
import { CopilotSkeleton, JobsSkeleton } from "@/components/dashboard/skeletons";

const ROUTE_SKELETONS: Record<string, React.ComponentType> = {
  "/dashboard": DashboardOverviewSkeleton,
  "/dashboard/resume": DashboardResumeSkeleton,
  "/dashboard/jobs": JobsSkeleton,
  "/dashboard/applications": ApplicationPageSkeleton,
  "/dashboard/skills": SkillGapPageSkeleton,
  "/dashboard/interview": InterviewPageSkeleton,
  "/dashboard/roadmap": RoadmapPageSkeleton,
  "/dashboard/copilot": CopilotSkeleton,
  "/dashboard/analytics": AnalyticsPageSkeleton,
  "/dashboard/settings": SettingsPageSkeleton,
};

function normalizeHref(href: string): string {
  return href.split("?")[0]?.split("#")[0] ?? href;
}

export function RouteSkeleton({ href }: { href: string }) {
  const path = normalizeHref(href);
  const Skeleton = ROUTE_SKELETONS[path] ?? DashboardOverviewSkeleton;
  return <Skeleton />;
}
