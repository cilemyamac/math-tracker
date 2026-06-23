using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MathTrack.Api.Data;
using MathTrack.Api.Domain;
using MathTrack.Api.Dtos;

namespace MathTrack.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/students")]
public class StudentsController : ControllerBase
{
    private readonly AppDbContext _db;

    public StudentsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var students = await _db.Students
            .Select(s => new
            {
                Student      = s,
                AverageScore = s.ExamResults.Any() ? (double?)s.ExamResults.Average(r => r.Score) : null,
                ExamsTaken   = s.ExamResults.Count(),
            })
            .ToListAsync();

        var dtos = students.Select(x => ToDto(x.Student, x.AverageScore, x.ExamsTaken));
        return Ok(dtos);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var student = await _db.Students
            .Include(s => s.ExamResults)
                .ThenInclude(r => r.Exam)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (student is null) return NotFound();

        var avg  = student.ExamResults.Any() ? (double?)student.ExamResults.Average(r => r.Score) : null;
        var summary = student.ExamResults
            .OrderByDescending(r => r.Exam.Date)
            .Take(10)
            .Select(r => new StudentResultSummaryDto(r.ExamId, r.Exam.Title, r.Exam.Topic, r.Exam.Date, r.Score, r.CorrectCount))
            .ToList();

        var dto = new StudentDetailDto(
            student.Id,
            student.FullName,
            student.Email,
            student.GradeLevel,
            student.EnrollmentDate,
            student.Status,
            avg,
            student.ExamResults.Count,
            summary
        );

        return Ok(dto);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateStudentRequest req)
    {
        var student = new Student
        {
            FullName       = req.FullName,
            Email          = req.Email,
            GradeLevel     = req.GradeLevel,
            EnrollmentDate = req.EnrollmentDate,
            Status         = req.Status,
        };

        _db.Students.Add(student);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = student.Id }, ToDto(student, null, 0));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateStudentRequest req)
    {
        var student = await _db.Students.FindAsync(id);
        if (student is null) return NotFound();

        student.FullName       = req.FullName;
        student.Email          = req.Email;
        student.GradeLevel     = req.GradeLevel;
        student.EnrollmentDate = req.EnrollmentDate;
        student.Status         = req.Status;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var student = await _db.Students.FindAsync(id);
        if (student is null) return NotFound();

        _db.Students.Remove(student);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static StudentDto ToDto(Student s, double? avg, int examsTaken) =>
        new(s.Id, s.FullName, s.Email, s.GradeLevel, s.EnrollmentDate, s.Status, avg, examsTaken);
}
