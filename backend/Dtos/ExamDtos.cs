namespace MathTrack.Api.Dtos;

public record ExamDto(int Id, string Title, string Topic, DateTime Date, int MaxScore, int QuestionCount);
public record CreateExamRequest(string Title, string Topic, DateTime Date, int MaxScore, int QuestionCount);
public record UpdateExamRequest(string Title, string Topic, DateTime Date, int MaxScore, int QuestionCount);
