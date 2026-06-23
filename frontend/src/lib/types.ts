export type UserRole = 'Admin' | 'Teacher'

export interface User {
  id: number
  email: string
  fullName: string
  role: UserRole
}

export type StudentStatus = 'Active' | 'Inactive'

export interface Student {
  id: number
  fullName: string
  email: string
  gradeLevel: number
  enrollmentDate: string
  status: StudentStatus
}

export interface Exam {
  id: number
  title: string
  topic: string
  date: string
  maxScore: number
  questionCount: number
}

export interface ExamResult {
  id: number
  examId: number
  studentId: number
  score: number
  submittedAt: string
}

export interface ScoreTrendPoint {
  label: string
  average: number
}

export interface TopicMasteryPoint {
  topic: string
  mastery: number
}

export interface GradeDistributionPoint {
  grade: string
  count: number
}

export interface RecentExamSummary {
  id: number
  title: string
  topic: string
  date: string
  averageScore: number
  participants: number
}

export interface DashboardAnalytics {
  totalStudents: number
  averageScore: number
  examsTaken: number
  passRate: number
  scoreTrend: ScoreTrendPoint[]
  topicMastery: TopicMasteryPoint[]
  gradeDistribution: GradeDistributionPoint[]
  recentExams: RecentExamSummary[]
}

export interface ScoreDistributionBucket {
  range: string
  count: number
}

export interface TopicDifficultyPoint {
  topic: string
  correctRate: number
}

export interface ExamAnalytics {
  examId: number
  title: string
  topic: string
  date: string
  maxScore: number
  participantCount: number
  averageScore: number
  passRate: number
  scoreDistribution: ScoreDistributionBucket[]
  topicDifficulty: TopicDifficultyPoint[]
}

export interface StudentExamHistoryEntry {
  examId: number
  title: string
  date: string
  score: number
  maxScore: number
}

export interface StudentAnalytics {
  studentId: number
  fullName: string
  averageScore: number
  scoreTrend: ScoreTrendPoint[]
  topicMastery: TopicMasteryPoint[]
  examHistory: StudentExamHistoryEntry[]
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  fullName: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}
