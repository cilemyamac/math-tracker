namespace MathTrack.Api.Domain;

public class Student
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int GradeLevel { get; set; }
    public DateTime EnrollmentDate { get; set; }
    public string Status { get; set; } = "Active"; // "Active" or "Inactive"

    public ICollection<ExamResult> ExamResults { get; set; } = [];
}
