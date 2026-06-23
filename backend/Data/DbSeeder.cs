using MathTrack.Api.Domain;

namespace MathTrack.Api.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        if (db.Users.Any()) return;

        var rng = new Random(12345);

        // --- Users ---
        var users = new List<User>
        {
            new() { Email = "admin@mathtrack.io",   PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),   FullName = "Admin User",      Role = "Admin"   },
            new() { Email = "teacher@mathtrack.io", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Teacher123!"), FullName = "Teacher Account",  Role = "Teacher" },
        };
        db.Users.AddRange(users);

        // --- Students ---
        var studentData = new[]
        {
            ("Emma Johnson",    "emma.johnson@school.edu",    10, "Active"),
            ("Liam Williams",   "liam.williams@school.edu",   11, "Active"),
            ("Olivia Brown",    "olivia.brown@school.edu",    12, "Active"),
            ("Noah Jones",      "noah.jones@school.edu",       9, "Active"),
            ("Ava Garcia",      "ava.garcia@school.edu",      10, "Active"),
            ("Elijah Miller",   "elijah.miller@school.edu",   11, "Active"),
            ("Sophia Davis",    "sophia.davis@school.edu",    12, "Active"),
            ("James Wilson",    "james.wilson@school.edu",     9, "Active"),
            ("Isabella Moore",  "isabella.moore@school.edu",  10, "Active"),
            ("Oliver Taylor",   "oliver.taylor@school.edu",   11, "Active"),
            ("Mia Anderson",    "mia.anderson@school.edu",    12, "Active"),
            ("Benjamin Thomas", "ben.thomas@school.edu",       9, "Active"),
            ("Charlotte White", "charlotte.white@school.edu", 10, "Active"),
            ("Lucas Harris",    "lucas.harris@school.edu",    11, "Active"),
            ("Amelia Jackson",  "amelia.jackson@school.edu",  12, "Active"),
            ("Mason Martin",    "mason.martin@school.edu",     9, "Active"),
            ("Harper Lee",      "harper.lee@school.edu",      10, "Active"),
            ("Ethan Walker",    "ethan.walker@school.edu",    11, "Active"),
            ("Evelyn Hall",     "evelyn.hall@school.edu",     12, "Inactive"),
            ("Alexander Allen", "alex.allen@school.edu",       9, "Active"),
            ("Abigail Young",   "abigail.young@school.edu",   10, "Active"),
            ("Henry King",      "henry.king@school.edu",      11, "Inactive"),
            ("Emily Wright",    "emily.wright@school.edu",    12, "Active"),
            ("Daniel Scott",    "daniel.scott@school.edu",     9, "Active"),
        };

        var baseEnrollment = new DateTime(2024, 9, 1);
        var students = studentData.Select((s, i) => new Student
        {
            FullName       = s.Item1,
            Email          = s.Item2,
            GradeLevel     = s.Item3,
            Status         = s.Item4,
            EnrollmentDate = baseEnrollment.AddDays(rng.Next(0, 30)),
        }).ToList();

        db.Students.AddRange(students);

        // --- Exams ---
        var today = new DateTime(2026, 6, 23);
        var examData = new[]
        {
            ("Algebra Fundamentals",        "Algebra",       today.AddDays(-170), 100, 30),
            ("Linear Equations Quiz",       "Algebra",       today.AddDays(-140), 100, 20),
            ("Geometry Basics",             "Geometry",      today.AddDays(-120), 100, 25),
            ("Pythagorean Theorem Test",    "Geometry",      today.AddDays(-100), 100, 20),
            ("Calculus Introduction",       "Calculus",      today.AddDays(-85),  100, 35),
            ("Derivatives & Integrals",     "Calculus",      today.AddDays(-65),  100, 40),
            ("Trigonometry Fundamentals",   "Trigonometry",  today.AddDays(-50),  100, 30),
            ("Statistics & Data Analysis",  "Statistics",    today.AddDays(-35),  100, 25),
            ("Probability Theory",          "Probability",   today.AddDays(-20),  100, 20),
            ("Arithmetic Review",           "Arithmetic",    today.AddDays(-7),   100, 25),
        };

        var exams = examData.Select(e => new Exam
        {
            Title         = e.Item1,
            Topic         = e.Item2,
            Date          = e.Item3,
            MaxScore      = e.Item4,
            QuestionCount = e.Item5,
        }).ToList();

        db.Exams.AddRange(exams);
        db.SaveChanges();

        // --- Topic sub-categories per exam topic ---
        var topicSubTopics = new Dictionary<string, string[]>
        {
            ["Algebra"]       = ["Variables & Expressions", "Linear Equations", "Inequalities", "Polynomials"],
            ["Geometry"]      = ["Lines & Angles", "Triangles", "Circles", "Area & Volume"],
            ["Calculus"]      = ["Limits", "Derivatives", "Integrals", "Applications"],
            ["Trigonometry"]  = ["Sine & Cosine", "Tangent", "Identities", "Applications"],
            ["Statistics"]    = ["Mean & Median", "Variance", "Distributions", "Hypothesis Testing"],
            ["Probability"]   = ["Basic Probability", "Conditional Probability", "Combinations", "Expected Value"],
            ["Arithmetic"]    = ["Fractions", "Decimals", "Percentages", "Word Problems"],
        };

        // --- ExamResults and TopicScores ---
        var results = new List<ExamResult>();
        var topicScores = new List<TopicScore>();

        foreach (var exam in exams)
        {
            // Pick ~20 out of 24 students per exam
            var participants = students
                .Where(s => s.Status == "Active")
                .OrderBy(_ => rng.Next())
                .Take(20)
                .ToList();

            var subTopics = topicSubTopics.TryGetValue(exam.Topic, out var st) ? st : ["General"];

            foreach (var student in participants)
            {
                // Generate a score with realistic spread, slightly grade-weighted
                var gradeBonus = (student.GradeLevel - 9) * 3;
                var baseScore  = rng.Next(45, 95) + gradeBonus;
                var score      = Math.Min(100, Math.Max(40, baseScore));
                var correct    = (int)Math.Round(score / 100.0 * exam.QuestionCount);
                var time       = rng.Next(20, 90);

                var result = new ExamResult
                {
                    ExamId            = exam.Id,
                    StudentId         = student.Id,
                    Score             = score,
                    CorrectCount      = correct,
                    TimeSpentMinutes  = time,
                };
                results.Add(result);
                db.ExamResults.Add(result);
                db.SaveChanges(); // get result.Id for FK

                // Distribute correct across sub-topics
                var topicsToUse = subTopics.Take(rng.Next(3, 5)).ToArray();
                var remaining   = correct;
                var totalQ      = exam.QuestionCount;

                for (var t = 0; t < topicsToUse.Length; t++)
                {
                    var isLast   = t == topicsToUse.Length - 1;
                    var topicQ   = isLast ? totalQ : totalQ / topicsToUse.Length + rng.Next(-2, 3);
                    topicQ       = Math.Max(2, topicQ);
                    var topicC   = isLast ? remaining : Math.Min(remaining, (int)Math.Round((double)topicQ / exam.QuestionCount * correct) + rng.Next(-1, 2));
                    topicC       = Math.Max(0, Math.Min(topicC, topicQ));

                    topicScores.Add(new TopicScore
                    {
                        ExamResultId = result.Id,
                        TopicName    = topicsToUse[t],
                        Correct      = topicC,
                        Total        = topicQ,
                    });

                    remaining -= topicC;
                    totalQ    -= topicQ;
                    remaining  = Math.Max(0, remaining);
                    totalQ     = Math.Max(0, totalQ);
                }
            }
        }

        db.TopicScores.AddRange(topicScores);
        db.SaveChanges();
    }
}
