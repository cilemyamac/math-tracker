import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, BookOpen, TrendingUp, Trophy, Plus } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts'
import { apiClient } from '@/lib/api'
import type { Student, StudentAnalytics, Exam } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

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

interface ResultForm {
  examId: string
  score: string
  correctCount: string
  timeSpentMinutes: string
}

const defaultResultForm: ResultForm = {
  examId: '',
  score: '',
  correctCount: '',
  timeSpentMinutes: '',
}

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [student, setStudent] = useState<Student | null>(null)
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [exams, setExams] = useState<Exam[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<ResultForm>(defaultResultForm)
  const [submitting, setSubmitting] = useState(false)

  const fetchAll = useCallback(async () => {
    if (!id) return
    try {
      const [studentRes, analyticsRes] = await Promise.all([
        apiClient.get<Student>(`/students/${id}`),
        apiClient.get<StudentAnalytics>(`/analytics/student/${id}`),
      ])
      setStudent(studentRes.data)
      setAnalytics(analyticsRes.data)
    } catch {
      toast.error('Failed to load student data.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  useEffect(() => {
    apiClient
      .get<Exam[]>('/exams')
      .then((res) => setExams(res.data))
      .catch(() => {
        /* exams list is optional for this page */
      })
  }, [])

  const handleRecordResult = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.examId) {
      toast.error('Please select an exam.')
      return
    }
    const exam = exams.find((x) => x.id === Number(form.examId))
    const score = Number(form.score)
    if (exam && (score < 0 || score > exam.maxScore)) {
      toast.error(`Score must be between 0 and ${exam.maxScore}.`)
      return
    }
    setSubmitting(true)
    try {
      await apiClient.post('/results', {
        examId: Number(form.examId),
        studentId: Number(id),
        score,
        correctCount: Number(form.correctCount) || 0,
        timeSpentMinutes: Number(form.timeSpentMinutes) || 0,
      })
      toast.success('Exam result recorded.')
      setDialogOpen(false)
      setForm(defaultResultForm)
      await fetchAll()
    } catch {
      toast.error('Failed to record result.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
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

  if (!student || !analytics) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Student not found.</p>
        <Link
          to="/students"
          className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline underline-offset-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Students
        </Link>
      </div>
    )
  }

  const bestTopic =
    analytics.topicMastery.length > 0
      ? analytics.topicMastery.reduce((a, b) => (a.mastery >= b.mastery ? a : b)).topic
      : '—'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/students"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </Link>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Record Exam Result
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Record Exam Result</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRecordResult} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="exam">Exam</Label>
                <Select
                  value={form.examId}
                  onValueChange={(v) => setForm((f) => ({ ...f, examId: v }))}
                >
                  <SelectTrigger id="exam">
                    <SelectValue placeholder="Select an exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((exam) => (
                      <SelectItem key={exam.id} value={String(exam.id)}>
                        {exam.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="score">Score</Label>
                  <Input
                    id="score"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={form.score}
                    onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correct">Correct answers</Label>
                  <Input
                    id="correct"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={form.correctCount}
                    onChange={(e) => setForm((f) => ({ ...f, correctCount: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time spent (minutes)</Label>
                <Input
                  id="time"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.timeSpentMinutes}
                  onChange={(e) => setForm((f) => ({ ...f, timeSpentMinutes: e.target.value }))}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Saving…' : 'Save Result'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Header card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white">
                {getInitials(student.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">{student.fullName}</h2>
              <p className="text-sm text-muted-foreground">{student.email}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="outline">Grade {student.gradeLevel}</Badge>
                <Badge
                  variant={student.status === 'Active' ? 'success' : 'secondary'}
                  className={cn(student.status === 'Inactive' && 'text-muted-foreground')}
                >
                  {student.status}
                </Badge>
                <span className="text-xs text-muted-foreground self-center">
                  Enrolled {formatDate(student.enrollmentDate)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
              <BookOpen className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.examHistory.length}</p>
              <p className="text-xs text-muted-foreground">Exams taken</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
              <TrendingUp className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.averageScore.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Average score</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              <Trophy className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold truncate max-w-[140px]" title={bestTopic}>
                {bestTopic}
              </p>
              <p className="text-xs text-muted-foreground">Best topic</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.scoreTrend.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No trend data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart
                  data={analytics.scoreTrend}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: '#6366f1', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Topic Mastery</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topicMastery.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No mastery data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart
                  data={analytics.topicMastery}
                  margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
                >
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis
                    dataKey="topic"
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  />
                  <Radar
                    dataKey="mastery"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                      fontSize: 12,
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Exam history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exam History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {analytics.examHistory.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No exams taken yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Max</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.examHistory.map((entry) => (
                  <TableRow key={entry.examId}>
                    <TableCell>
                      <Link
                        to={`/exams/${entry.examId}`}
                        className="font-medium text-foreground hover:text-primary hover:underline underline-offset-4"
                      >
                        {entry.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(entry.date)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold',
                          scoreBadgeClass(entry.score, entry.maxScore),
                        )}
                      >
                        {entry.score}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{entry.maxScore}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
