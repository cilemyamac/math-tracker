namespace MathTrack.Api.Domain;

public class ExamResult
{
    public int Id { get; set; }
    public int ExamId { get; set; }
    public Exam Exam { get; set; } = null!;
    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;
    public int Score { get; set; }
    public int CorrectCount { get; set; }
    public int TimeSpentMinutes { get; set; }

    public ICollection<TopicScore> TopicScores { get; set; } = [];
}
