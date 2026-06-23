namespace MathTrack.Api.Dtos;

public record ExamResultDto(
    int Id,
    int ExamId,
    string ExamTitle,
    int StudentId,
    string StudentName,
    int Score,
    int CorrectCount,
    int TimeSpentMinutes,
    List<TopicScoreDto> TopicScores
);

public record TopicScoreDto(int Id, string TopicName, int Correct, int Total);

public record CreateResultRequest(
    int ExamId,
    int StudentId,
    int Score,
    int CorrectCount,
    int TimeSpentMinutes,
    List<CreateTopicScoreRequest>? TopicScores
);

public record CreateTopicScoreRequest(string TopicName, int Correct, int Total);
