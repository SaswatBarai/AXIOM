'use client';

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { generateTrendData } from "@/hooks/useAdmin";
import type { AdminOverview } from "@/hooks/useAdmin";

interface AnalyticsChartsProps {
  data: AdminOverview;
}

interface ChartCardProps {
  title: string;
  value: string;
  color: string;
  data: { day: string; value: number }[];
  gradientId: string;
}

function MiniChart({ title, value, color, data, gradientId }: ChartCardProps) {
  return (
    <div className="border border-border-subtle bg-bg-card/25 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[11px] text-text-secondary font-medium">{title}</div>
          <div className="text-lg font-bold text-text-primary mt-0.5">{value}</div>
        </div>
      </div>
      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" opacity={0.2} />
            <XAxis dataKey="day" hide />
            <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
            <Tooltip
              contentStyle={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
              labelStyle={{ color: "var(--text-muted)" }}
              itemStyle={{ color: "var(--text-primary)" }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, fill: color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const [userTrend, setUserTrend] = useState<{ day: string; value: number }[]>([]);
  const [appTrend, setAppTrend] = useState<{ day: string; value: number }[]>([]);
  const [premiumTrend, setPremiumTrend] = useState<{ day: string; value: number }[]>([]);
  const [jobTrend, setJobTrend] = useState<{ day: string; value: number }[]>([]);

  useEffect(() => {
    setUserTrend(generateTrendData(14, data.totalUsers));
    setAppTrend(generateTrendData(14, data.totalApplications));
    setPremiumTrend(generateTrendData(14, data.premiumUsers));
    setJobTrend(generateTrendData(14, data.totalJobs));
  }, [data]);

  return (
    <div className="mb-6">
      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2.5">Trends</div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniChart title="User Growth" value={formatNumber(data.totalUsers)} color="#3b82f6" data={userTrend} gradientId="userGrad" />
        <MiniChart title="Applications" value={formatNumber(data.totalApplications)} color="#10b981" data={appTrend} gradientId="appGrad" />
        <MiniChart title="Premium Users" value={formatNumber(data.premiumUsers)} color="#f59e0b" data={premiumTrend} gradientId="premGrad" />
        <MiniChart title="Jobs Posted" value={formatNumber(data.totalJobs)} color="#8b5cf6" data={jobTrend} gradientId="jobGrad" />
      </div>
    </div>
  );
}
