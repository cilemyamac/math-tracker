using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MathTrack.Api.Data;
using MathTrack.Api.Domain;
using MathTrack.Api.Dtos;

namespace MathTrack.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/exams")]
public class ExamsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ExamsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var exams = await _db.Exams.ToListAsync();
        return Ok(exams.Select(ToDto));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var exam = await _db.Exams.FindAsync(id);
        if (exam is null) return NotFound();
        return Ok(ToDto(exam));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateExamRequest req)
    {
        var exam = new Exam
        {
            Title         = req.Title,
            Topic         = req.Topic,
            Date          = req.Date,
            MaxScore      = req.MaxScore,
            QuestionCount = req.QuestionCount,
        };

        _db.Exams.Add(exam);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = exam.Id }, ToDto(exam));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateExamRequest req)
    {
        var exam = await _db.Exams.FindAsync(id);
        if (exam is null) return NotFound();

        exam.Title         = req.Title;
        exam.Topic         = req.Topic;
        exam.Date          = req.Date;
        exam.MaxScore      = req.MaxScore;
        exam.QuestionCount = req.QuestionCount;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var exam = await _db.Exams.FindAsync(id);
        if (exam is null) return NotFound();

        _db.Exams.Remove(exam);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static ExamDto ToDto(Exam e) =>
        new(e.Id, e.Title, e.Topic, e.Date, e.MaxScore, e.QuestionCount);
}
