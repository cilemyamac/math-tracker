import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Users, BarChart3, BookOpen, TrendingUp } from 'lucide-react'
import type { DashboardAnalytics } from '@/lib/types'
import { apiClient } from '@/lib/api'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScoreTrendChart } from '@/components/charts/ScoreTrendChart'
import { TopicMasteryChart } from '@/components/charts/TopicMasteryChart'
import { GradeDistributionChart } from '@/components/charts/GradeDistributionChart'

// ── helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function scoreBadgeClass(score: number): string {
  if (score >= 70) return 'border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
  if (score >= 50) return 'border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400'
  return 'border-transparent bg-red-500/15 text-red-600 dark:text-red-400'
}

// ── KPI card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string
  delta?: string
  icon: React.ReactNode
  iconBg: string
}

function KpiCard({ label, value, delta, icon, iconBg }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 pt-6">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg} text-white`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">{value}</p>
          {delta && (
            <p className="mt-0.5 text-xs text-muted-foreground">{delta}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function KpiCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 pt-6">
        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

// ── main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<DashboardAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    apiClient
      .get<DashboardAnalytics>('/analytics/dashboard')
      .then((res) => {
        if (!cancelled) setData(res.data)
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load dashboard analytics.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const kpis = data
    ? [
        {
          label: 'Total Students',
          value: data.totalStudents.toLocaleString(),
          delta: 'Enrolled and active',
          icon: <Users className="h-5 w-5" />,
          iconBg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
        },
        {
          label: 'Average Score',
          value: `${data.averageScore.toFixed(1)}%`,
          delta: 'Across all exams',
          icon: <TrendingUp className="h-5 w-5" />,
          iconBg: 'bg-gradient-to-br from-violet-500 to-violet-600',
        },
        {
          label: 'Exams Taken',
          value: data.examsTaken.toLocaleString(),
          delta: 'Total submissions',
          icon: <BookOpen className="h-5 w-5" />,
          iconBg: 'bg-gradient-to-br from-indigo-500 to-violet-600',
        },
        {
          label: 'Pass Rate',
          value: `${data.passRate.toFixed(1)}%`,
          delta: 'Students scoring ≥ 60%',
          icon: <BarChart3 className="h-5 w-5" />,
          iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
        },
      ]
    : []

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Overview of student performance and exam analytics.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
          : kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
      </div>

      {/* Charts row: Score trend (2/3) + Topic mastery (1/3) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[220px] w-full rounded-md" />
            ) : (
              <ScoreTrendChart data={data?.scoreTrend ?? []} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Topic Mastery</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[220px] w-full rounded-md" />
            ) : (
              <TopicMasteryChart data={data?.topicMastery ?? []} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row: Grade distribution + Recent exams table */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[220px] w-full rounded-md" />
            ) : (
              <GradeDistributionChart data={data?.gradeDistribution ?? []} />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Exams</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {loading ? (
              <div className="space-y-3 px-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full rounded-md" />
                ))}
              </div>
            ) : !data?.recentExams.length ? (
              <p className="px-6 text-sm text-muted-foreground">No recent exams.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Participants</TableHead>
                    <TableHead className="text-right">Avg Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentExams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell>
                        <Link
                          to={`/exams/${exam.id}`}
                          className="font-medium text-foreground underline-offset-4 hover:underline hover:text-primary"
                        >
                          {exam.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {exam.topic}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(exam.date)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {exam.participants}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${scoreBadgeClass(exam.averageScore)}`}
                        >
                          {exam.averageScore.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
