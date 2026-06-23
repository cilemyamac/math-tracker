import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Users, TrendingUp, Award, TrendingDown } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { apiClient } from '@/lib/api'
import type { ExamAnalytics } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

// ExamAnalytics doesn't include a per-result list, so we use what the API provides.
// The results table will show score distribution buckets as a summary instead.

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function scoreBadgeClass(score: number, max: number) {
  const pct = max > 0 ? (score / max) * 100 : 0
  if (pct >= 70) return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-transparent'
  if (pct >= 50) return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-transparent'
  return 'bg-red-500/15 text-red-600 dark:text-red-400 border-transparent'
}

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [analytics, setAnalytics] = useState<ExamAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetchAnalytics = async () => {
      try {
        const res = await apiClient.get<ExamAnalytics>(`/analytics/exam/${id}`)
        setAnalytics(res.data)
      } catch {
        toast.error('Failed to load exam analytics.')
      } finally {
        setLoading(false)
      }
    }
    void fetchAnalytics()
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Exam not found.</p>
        <Link
          to="/exams"
          className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline underline-offset-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Exams
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        to="/exams"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Exams
      </Link>

      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{analytics.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{formatDate(analytics.date)}</p>
            </div>
            <Badge variant="secondary" className="self-start sm:self-auto">
              {analytics.topic}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                <TrendingUp className="h-4 w-4 text-indigo-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{analytics.averageScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Average</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <Award className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{analytics.maxScore}</p>
                <p className="text-xs text-muted-foreground">Max score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                <TrendingDown className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{(analytics.passRate * 100).toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Pass rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                <Users className="h-4 w-4 text-violet-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{analytics.participantCount}</p>
                <p className="text-xs text-muted-foreground">Participants</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.scoreDistribution.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No distribution data.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={analytics.scoreDistribution}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="range"
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Topic Difficulty (Correct Rate)</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topicDifficulty.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No difficulty data.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={analytics.topicDifficulty}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 1]}
                    tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="topic"
                    type="category"
                    width={90}
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(v) => [typeof v === 'number' ? `${(v * 100).toFixed(1)}%` : v, 'Correct rate']}
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="correctRate" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Score distribution summary table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Score Buckets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {analytics.scoreDistribution.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No data available.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Range</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Score Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.scoreDistribution.map((bucket) => {
                  const rangeStart = parseInt(bucket.range.split('-')[0] ?? '0', 10)
                  return (
                    <TableRow key={bucket.range}>
                      <TableCell className="font-medium">{bucket.range}</TableCell>
                      <TableCell>{bucket.count}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold',
                            scoreBadgeClass(rangeStart, 100),
                          )}
                        >
                          {rangeStart >= 70 ? 'Pass' : rangeStart >= 50 ? 'Borderline' : 'Fail'}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
