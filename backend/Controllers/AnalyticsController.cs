using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MathTrack.Api.Data;
using MathTrack.Api.Dtos;
using System.Globalization;

namespace MathTrack.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/analytics")]
public class AnalyticsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AnalyticsController(AppDbContext db) => _db = db;

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var totalStudents = await _db.Students.CountAsync();
        var allResults    = await _db.ExamResults.Include(r => r.Exam).ToListAsync();

        var avgScore    = allResults.Any() ? allResults.Average(r => r.Score) : 0;
        var examsTaken  = allResults.Count;
        var passRate    = allResults.Any() ? allResults.Count(r => r.Score >= 60) * 100.0 / allResults.Count : 0;

        // Score trend by exam date (grouped by month)
        var scoreTrend = allResults
            .GroupBy(r => r.Exam.Date.ToString("MMM yyyy", CultureInfo.InvariantCulture))
            .OrderBy(g => DateTime.Parse(g.Key, CultureInfo.InvariantCulture))
            .Select(g => new ScoreTrendPoint(g.Key, Math.Round(g.Average(r => r.Score), 1)))
            .ToList();

        // Topic mastery
        var topicScores = await _db.TopicScores.ToListAsync();
        var topicMastery = topicScores
            .GroupBy(t => t.TopicName)
            .Select(g => new TopicMasteryPoint(
                g.Key,
                g.Sum(t => t.Total) > 0
                    ? Math.Round(g.Sum(t => t.Correct) * 100.0 / g.Sum(t => t.Total), 1)
                    : 0))
            .OrderByDescending(t => t.Mastery)
            .ToList();

        // Grade distribution
        var gradeDistribution = await _db.Students
            .GroupBy(s => s.GradeLevel)
            .Select(g => new GradeDistributionPoint("Grade " + g.Key, g.Count()))
            .ToListAsync();

        // Recent exams (last 5)
        var recentExams = await _db.Exams
            .OrderByDescending(e => e.Date)
            .Take(5)
            .Select(e => new RecentExamSummary(
                e.Id,
                e.Title,
                e.Topic,
                e.Date,
                e.ExamResults.Any() ? Math.Round(e.ExamResults.Average(r => r.Score), 1) : 0,
                e.ExamResults.Count()))
            .ToListAsync();

        return Ok(new DashboardDto(
            totalStudents,
            Math.Round(avgScore, 1),
            examsTaken,
            Math.Round(passRate, 1),
            scoreTrend,
            topicMastery,
            gradeDistribution,
            recentExams
        ));
    }

    [HttpGet("exam/{id:int}")]
    public async Task<IActionResult> ExamAnalytics(int id)
    {
        var exam = await _db.Exams.FindAsync(id);
        if (exam is null) return NotFound();

        var results = await _db.ExamResults
            .Include(r => r.Student)
            .Include(r => r.TopicScores)
            .Where(r => r.ExamId == id)
            .ToListAsync();

        if (!results.Any())
        {
            return Ok(new ExamAnalyticsDto(
                exam.Id, exam.Title, exam.Topic, exam.Date, exam.MaxScore,
                0, 0, 0, [], []
            ));
        }

        var avg          = Math.Round(results.Average(r => r.Score), 1);
        var participants = results.Count;
        var passRate     = Math.Round(results.Count(r => r.Score >= 60) * 1.0 / participants, 3);

        var buckets = new[] { "0-49", "50-59", "60-69", "70-79", "80-89", "90-100" };
        var distribution = buckets.Select(b =>
        {
            var (lo, hi) = b switch
            {
                "0-49"   => (0, 49),
                "50-59"  => (50, 59),
                "60-69"  => (60, 69),
                "70-79"  => (70, 79),
                "80-89"  => (80, 89),
                _        => (90, 100),
            };
            return new ScoreDistributionBucket(b, results.Count(r => r.Score >= lo && r.Score <= hi));
        }).ToList();

        var topicDifficulty = results
            .SelectMany(r => r.TopicScores)
            .GroupBy(t => t.TopicName)
            .Select(g => new TopicDifficultyPoint(
                g.Key,
                g.Sum(t => t.Total) > 0
                    ? Math.Round(g.Sum(t => t.Correct) * 1.0 / g.Sum(t => t.Total), 3)
                    : 0))
            .ToList();

        return Ok(new ExamAnalyticsDto(
            exam.Id, exam.Title, exam.Topic, exam.Date, exam.MaxScore,
            participants, avg, passRate,
            distribution, topicDifficulty
        ));
    }

    [HttpGet("student/{id:int}")]
    public async Task<IActionResult> StudentAnalytics(int id)
    {
        var student = await _db.Students.FindAsync(id);
        if (student is null) return NotFound();

        var results = await _db.ExamResults
            .Include(r => r.Exam)
            .Include(r => r.TopicScores)
            .Where(r => r.StudentId == id)
            .OrderBy(r => r.Exam.Date)
            .ToListAsync();

        var avg = results.Any() ? Math.Round(results.Average(r => r.Score), 1) : 0;

        var scoreTrend = results
            .Select(r => new ScoreTrendPoint(r.Exam.Date.ToString("MMM d", CultureInfo.InvariantCulture), r.Score))
            .ToList();

        var topicMastery = results
            .SelectMany(r => r.TopicScores)
            .GroupBy(t => t.TopicName)
            .Select(g => new TopicMasteryPoint(
                g.Key,
                g.Sum(t => t.Total) > 0
                    ? Math.Round(g.Sum(t => t.Correct) * 100.0 / g.Sum(t => t.Total), 1)
                    : 0))
            .ToList();

        var examHistory = results
            .OrderByDescending(r => r.Exam.Date)
            .Select(r => new StudentExamHistoryEntry(
                r.ExamId,
                r.Exam.Title,
                r.Exam.Date.ToString("o"),
                r.Score,
                r.Exam.MaxScore))
            .ToList();

        return Ok(new StudentAnalyticsDto(student.Id, student.FullName, avg, scoreTrend, topicMastery, examHistory));
    }
}
