namespace MathTrack.Api.Dtos;

public record StudentDto(
    int Id,
    string FullName,
    string Email,
    int GradeLevel,
    DateTime EnrollmentDate,
    string Status,
    double? AverageScore,
    int ExamsTaken
);

public record StudentDetailDto(
    int Id,
    string FullName,
    string Email,
    int GradeLevel,
    DateTime EnrollmentDate,
    string Status,
    double? AverageScore,
    int ExamsTaken,
    List<StudentResultSummaryDto> RecentResults
);

public record StudentResultSummaryDto(int ExamId, string ExamTitle, string Topic, DateTime ExamDate, int Score, int CorrectCount);

public record CreateStudentRequest(string FullName, string Email, int GradeLevel, DateTime EnrollmentDate, string Status);
public record UpdateStudentRequest(string FullName, string Email, int GradeLevel, DateTime EnrollmentDate, string Status);
