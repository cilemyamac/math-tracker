import { useState, useEffect, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Users, BookOpen } from 'lucide-react'
import { apiClient } from '@/lib/api'
import type { Student, Exam, StudentStatus } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

// ── helpers ──────────────────────────────────────────────────────────────────

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

// ── Student form ─────────────────────────────────────────────────────────────

interface StudentFormData {
  fullName: string
  email: string
  gradeLevel: string
  status: StudentStatus
}

const defaultStudentForm: StudentFormData = {
  fullName: '',
  email: '',
  gradeLevel: '9',
  status: 'Active',
}

function studentToForm(s: Student): StudentFormData {
  return {
    fullName: s.fullName,
    email: s.email,
    gradeLevel: String(s.gradeLevel),
    status: s.status,
  }
}

interface StudentDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial?: Student | null
  onSaved: () => void
}

function StudentDialog({ open, onOpenChange, initial, onSaved }: StudentDialogProps) {
  const [form, setForm] = useState<StudentFormData>(
    initial ? studentToForm(initial) : defaultStudentForm,
  )
  const [submitting, setSubmitting] = useState(false)

  // Sync when dialog opens with a new target
  useEffect(() => {
    setForm(initial ? studentToForm(initial) : defaultStudentForm)
  }, [initial, open])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.fullName || !form.email) {
      toast.error('Name and email are required.')
      return
    }
    setSubmitting(true)
    try {
      const payload = { ...form, gradeLevel: Number(form.gradeLevel) }
      if (initial) {
        await apiClient.put(`/students/${initial.id}`, payload)
        toast.success('Student updated.')
      } else {
        await apiClient.post('/students', payload)
        toast.success('Student added.')
      }
      onSaved()
      onOpenChange(false)
    } catch {
      toast.error(initial ? 'Failed to update student.' : 'Failed to add student.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Student' : 'Add Student'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="s-fullName">Full Name</Label>
            <Input
              id="s-fullName"
              placeholder="Jane Doe"
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-email">Email</Label>
            <Input
              id="s-email"
              type="email"
              placeholder="jane@school.edu"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="s-grade">Grade</Label>
              <Select
                value={form.gradeLevel}
                onValueChange={(v) => setForm((f) => ({ ...f, gradeLevel: v }))}
              >
                <SelectTrigger id="s-grade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                    <SelectItem key={g} value={String(g)}>
                      Grade {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v as StudentStatus }))}
              >
                <SelectTrigger id="s-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Saving…' : initial ? 'Save Changes' : 'Add Student'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Exam form ─────────────────────────────────────────────────────────────────

interface ExamFormData {
  title: string
  topic: string
  date: string
  maxScore: string
  questionCount: string
}

const defaultExamForm: ExamFormData = {
  title: '',
  topic: '',
  date: '',
  maxScore: '100',
  questionCount: '20',
}

function examToForm(e: Exam): ExamFormData {
  return {
    title: e.title,
    topic: e.topic,
    date: e.date.split('T')[0] ?? e.date,
    maxScore: String(e.maxScore),
    questionCount: String(e.questionCount),
  }
}

interface ExamDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial?: Exam | null
  onSaved: () => void
}

function ExamDialog({ open, onOpenChange, initial, onSaved }: ExamDialogProps) {
  const [form, setForm] = useState<ExamFormData>(
    initial ? examToForm(initial) : defaultExamForm,
  )
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setForm(initial ? examToForm(initial) : defaultExamForm)
  }, [initial, open])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.topic || !form.date) {
      toast.error('Title, topic, and date are required.')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        maxScore: Number(form.maxScore),
        questionCount: Number(form.questionCount),
      }
      if (initial) {
        await apiClient.put(`/exams/${initial.id}`, payload)
        toast.success('Exam updated.')
      } else {
        await apiClient.post('/exams', payload)
        toast.success('Exam created.')
      }
      onSaved()
      onOpenChange(false)
    } catch {
      toast.error(initial ? 'Failed to update exam.' : 'Failed to create exam.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Exam' : 'Create Exam'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="e-title">Title</Label>
            <Input
              id="e-title"
              placeholder="Mid-term Algebra"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-topic">Topic</Label>
            <Input
              id="e-topic"
              placeholder="Algebra"
              value={form.topic}
              onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-date">Date</Label>
            <Input
              id="e-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="e-maxScore">Max Score</Label>
              <Input
                id="e-maxScore"
                type="number"
                min={1}
                value={form.maxScore}
                onChange={(e) => setForm((f) => ({ ...f, maxScore: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-questions">Questions</Label>
              <Input
                id="e-questions"
                type="number"
                min={1}
                value={form.questionCount}
                onChange={(e) => setForm((f) => ({ ...f, questionCount: e.target.value }))}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Saving…' : initial ? 'Save Changes' : 'Create Exam'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Confirm delete dialog ─────────────────────────────────────────────────────

interface ConfirmDeleteProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  label: string
  onConfirm: () => Promise<void>
}

function ConfirmDelete({ open, onOpenChange, label, onConfirm }: ConfirmDeleteProps) {
  const [deleting, setDeleting] = useState(false)

  const handleConfirm = async () => {
    setDeleting(true)
    try {
      await onConfirm()
    } finally {
      setDeleting(false)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete {label}</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Are you sure you want to delete this {label.toLowerCase()}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Students tab ──────────────────────────────────────────────────────────────

function StudentsTab() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState<Student | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const fetchStudents = async () => {
    try {
      const res = await apiClient.get<Student[]>('/students')
      setStudents(res.data)
    } catch {
      toast.error('Failed to load students.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchStudents()
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    await apiClient.delete(`/students/${deleteTarget.id}`)
    toast.success('Student deleted.')
    await fetchStudents()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          className="gap-2"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Student
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Users className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No students yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enrolled</TableHead>
                  <TableHead className="w-20 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-[10px] font-semibold text-white">
                          {getInitials(s.fullName)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{s.fullName}</TableCell>
                    <TableCell className="text-muted-foreground">{s.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        Grade {s.gradeLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={s.status === 'Active' ? 'success' : 'secondary'}
                        className={cn(s.status === 'Inactive' && 'text-muted-foreground')}
                      >
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(s.enrollmentDate)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditTarget(s)
                            setEditOpen(true)
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => {
                            setDeleteTarget(s)
                            setDeleteOpen(true)
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <StudentDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        initial={null}
        onSaved={() => { setLoading(true); void fetchStudents() }}
      />
      <StudentDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={editTarget}
        onSaved={() => { setLoading(true); void fetchStudents() }}
      />
      <ConfirmDelete
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        label="Student"
        onConfirm={handleDelete}
      />
    </div>
  )
}

// ── Exams tab ─────────────────────────────────────────────────────────────────

function ExamsTab() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState<Exam | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const fetchExams = async () => {
    try {
      const res = await apiClient.get<Exam[]>('/exams')
      setExams(res.data)
    } catch {
      toast.error('Failed to load exams.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchExams()
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    await apiClient.delete(`/exams/${deleteTarget.id}`)
    toast.success('Exam deleted.')
    await fetchExams()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          className="gap-2"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Exam
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : exams.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No exams yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Max Score</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead className="w-20 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {exam.topic}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(exam.date)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{exam.maxScore}</TableCell>
                    <TableCell className="text-muted-foreground">{exam.questionCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditTarget(exam)
                            setEditOpen(true)
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => {
                            setDeleteTarget(exam)
                            setDeleteOpen(true)
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ExamDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        initial={null}
        onSaved={() => { setLoading(true); void fetchExams() }}
      />
      <ExamDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={editTarget}
        onSaved={() => { setLoading(true); void fetchExams() }}
      />
      <ConfirmDelete
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        label="Exam"
        onConfirm={handleDelete}
      />
    </div>
  )
}

// ── AdminPage ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin</h2>
        <p className="text-sm text-muted-foreground">
          Manage students and exams across the platform.
        </p>
      </div>

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students" className="gap-2">
            <Users className="h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="exams" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Exams
          </TabsTrigger>
        </TabsList>
        <TabsContent value="students" className="mt-4">
          <StudentsTab />
        </TabsContent>
        <TabsContent value="exams" className="mt-4">
          <ExamsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
