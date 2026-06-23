namespace MathTrack.Api.Dtos;

public record DashboardDto(
    int TotalStudents,
    double AverageScore,
    int ExamsTaken,
    double PassRate,
    List<ScoreTrendPoint> ScoreTrend,
    List<TopicMasteryPoint> TopicMastery,
    List<GradeDistributionPoint> GradeDistribution,
    List<RecentExamSummary> RecentExams
);

public record ScoreTrendPoint(string Label, double Average);
public record TopicMasteryPoint(string Topic, double Mastery);
public record GradeDistributionPoint(string Grade, int Count);
public record RecentExamSummary(int Id, string Title, string Topic, DateTime Date, double AverageScore, int Participants);

public record ExamAnalyticsDto(
    int ExamId,
    string Title,
    string Topic,
    DateTime Date,
    int MaxScore,
    int ParticipantCount,
    double AverageScore,
    double PassRate,
    List<ScoreDistributionBucket> ScoreDistribution,
    List<TopicDifficultyPoint> TopicDifficulty
);

public record ScoreDistributionBucket(string Range, int Count);
public record TopicDifficultyPoint(string Topic, double CorrectRate);

public record StudentAnalyticsDto(
    int StudentId,
    string FullName,
    double AverageScore,
    List<ScoreTrendPoint> ScoreTrend,
    List<TopicMasteryPoint> TopicMastery,
    List<StudentExamHistoryEntry> ExamHistory
);

public record StudentExamHistoryEntry(int ExamId, string Title, string Date, int Score, int MaxScore);
