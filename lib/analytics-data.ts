export type KpiMetric = {
  id: string
  label: string
  value: string
  change: number
  trend: "up" | "down" | "neutral"
  description: string
}

export type ChartPoint = {
  date: string
  visitors: number
  pageViews: number
  sessions: number
}

export type ActivityItem = {
  id: string
  action: string
  target: string
  user: string
  time: string
  type: "view" | "click" | "signup" | "purchase" | "alert"
}

export type TopPage = {
  path: string
  views: number
  bounceRate: number
  avgTime: string
}

export type DeviceStat = {
  device: string
  percentage: number
  sessions: number
}

export const kpiMetrics: KpiMetric[] = [
  {
    id: "visitors",
    label: "Total Visitors",
    value: "24,892",
    change: 12.5,
    trend: "up",
    description: "vs last 30 days",
  },
  {
    id: "pageviews",
    label: "Page Views",
    value: "89,431",
    change: 8.2,
    trend: "up",
    description: "vs last 30 days",
  },
  {
    id: "sessions",
    label: "Active Sessions",
    value: "1,284",
    change: -3.1,
    trend: "down",
    description: "live now",
  },
  {
    id: "conversion",
    label: "Conversion Rate",
    value: "4.28%",
    change: 0.6,
    trend: "up",
    description: "vs last 30 days",
  },
]

export const chartData: ChartPoint[] = [
  { date: "Jun 1", visitors: 1240, pageViews: 4200, sessions: 980 },
  { date: "Jun 2", visitors: 1380, pageViews: 4650, sessions: 1100 },
  { date: "Jun 3", visitors: 1520, pageViews: 5100, sessions: 1250 },
  { date: "Jun 4", visitors: 1410, pageViews: 4890, sessions: 1180 },
  { date: "Jun 5", visitors: 1680, pageViews: 5420, sessions: 1340 },
  { date: "Jun 6", visitors: 1890, pageViews: 6100, sessions: 1520 },
  { date: "Jun 7", visitors: 1750, pageViews: 5780, sessions: 1410 },
  { date: "Jun 8", visitors: 1920, pageViews: 6350, sessions: 1580 },
  { date: "Jun 9", visitors: 2100, pageViews: 6920, sessions: 1720 },
]

export const recentActivity: ActivityItem[] = [
  {
    id: "1",
    action: "New signup",
    target: "/register",
    user: "Maria Santos",
    time: "2 min ago",
    type: "signup",
  },
  {
    id: "2",
    action: "Page view spike",
    target: "/dashboard",
    user: "System",
    time: "5 min ago",
    type: "alert",
  },
  {
    id: "3",
    action: "Purchase completed",
    target: "/checkout",
    user: "Juan Dela Cruz",
    time: "12 min ago",
    type: "purchase",
  },
  {
    id: "4",
    action: "CTA clicked",
    target: "/pricing",
    user: "Ana Reyes",
    time: "18 min ago",
    type: "click",
  },
  {
    id: "5",
    action: "Page viewed",
    target: "/features",
    user: "Guest #4821",
    time: "24 min ago",
    type: "view",
  },
]

export const topPages: TopPage[] = [
  { path: "/dashboard", views: 12450, bounceRate: 22, avgTime: "4m 32s" },
  { path: "/pricing", views: 8920, bounceRate: 35, avgTime: "2m 18s" },
  { path: "/features", views: 7340, bounceRate: 41, avgTime: "3m 05s" },
  { path: "/docs", views: 5680, bounceRate: 28, avgTime: "6m 44s" },
  { path: "/blog", views: 4210, bounceRate: 52, avgTime: "2m 51s" },
]

export const deviceStats: DeviceStat[] = [
  { device: "Mobile", percentage: 58, sessions: 14520 },
  { device: "Desktop", percentage: 32, sessions: 8010 },
  { device: "Tablet", percentage: 10, sessions: 2502 },
]

export const chartConfig = {
  visitors: { label: "Visitors", color: "var(--chart-1)" },
  pageViews: { label: "Page Views", color: "var(--chart-2)" },
  sessions: { label: "Sessions", color: "var(--chart-3)" },
}
