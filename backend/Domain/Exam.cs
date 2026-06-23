namespace MathTrack.Api.Domain;

public class Exam
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Topic { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public int MaxScore { get; set; }
    public int QuestionCount { get; set; }

    public ICollection<ExamResult> ExamResults { get; set; } = [];
}
