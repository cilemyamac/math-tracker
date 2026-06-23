namespace MathTrack.Api.Domain;

public class TopicScore
{
    public int Id { get; set; }
    public int ExamResultId { get; set; }
    public ExamResult ExamResult { get; set; } = null!;
    public string TopicName { get; set; } = string.Empty;
    public int Correct { get; set; }
    public int Total { get; set; }
}
