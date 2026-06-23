using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MathTrack.Api.Data;
using MathTrack.Api.Domain;
using MathTrack.Api.Dtos;

namespace MathTrack.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/results")]
public class ResultsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ResultsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? examId, [FromQuery] int? studentId)
    {
        var query = _db.ExamResults
            .Include(r => r.Exam)
            .Include(r => r.Student)
            .Include(r => r.TopicScores)
            .AsQueryable();

        if (examId.HasValue)   query = query.Where(r => r.ExamId    == examId.Value);
        if (studentId.HasValue) query = query.Where(r => r.StudentId == studentId.Value);

        var results = await query.ToListAsync();
        return Ok(results.Select(ToDto));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateResultRequest req)
    {
        if (!await _db.Exams.AnyAsync(e => e.Id == req.ExamId))
            return BadRequest(new { message = "Exam not found." });

        if (!await _db.Students.AnyAsync(s => s.Id == req.StudentId))
            return BadRequest(new { message = "Student not found." });

        var result = new ExamResult
        {
            ExamId           = req.ExamId,
            StudentId        = req.StudentId,
            Score            = req.Score,
            CorrectCount     = req.CorrectCount,
            TimeSpentMinutes = req.TimeSpentMinutes,
        };

        if (req.TopicScores is { Count: > 0 })
        {
            result.TopicScores = req.TopicScores
                .Select(t => new TopicScore { TopicName = t.TopicName, Correct = t.Correct, Total = t.Total })
                .ToList();
        }

        _db.ExamResults.Add(result);
        await _db.SaveChangesAsync();

        // reload for response
        await _db.Entry(result).Reference(r => r.Exam).LoadAsync();
        await _db.Entry(result).Reference(r => r.Student).LoadAsync();

        return CreatedAtAction(nameof(GetAll), new { examId = result.ExamId }, ToDto(result));
    }

    private static ExamResultDto ToDto(ExamResult r) => new(
        r.Id,
        r.ExamId,
        r.Exam.Title,
        r.StudentId,
        r.Student.FullName,
        r.Score,
        r.CorrectCount,
        r.TimeSpentMinutes,
        r.TopicScores.Select(t => new TopicScoreDto(t.Id, t.TopicName, t.Correct, t.Total)).ToList()
    );
}
