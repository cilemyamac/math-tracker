using Microsoft.EntityFrameworkCore;
using MathTrack.Api.Domain;

namespace MathTrack.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Exam> Exams => Set<Exam>();
    public DbSet<ExamResult> ExamResults => Set<ExamResult>();
    public DbSet<TopicScore> TopicScores => Set<TopicScore>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.HasIndex(u => u.Email).IsUnique();
        });

        modelBuilder.Entity<Student>(e =>
        {
            e.HasKey(s => s.Id);
        });

        modelBuilder.Entity<Exam>(e =>
        {
            e.HasKey(x => x.Id);
        });

        modelBuilder.Entity<ExamResult>(e =>
        {
            e.HasKey(r => r.Id);

            e.HasOne(r => r.Exam)
             .WithMany(x => x.ExamResults)
             .HasForeignKey(r => r.ExamId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(r => r.Student)
             .WithMany(s => s.ExamResults)
             .HasForeignKey(r => r.StudentId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TopicScore>(e =>
        {
            e.HasKey(t => t.Id);

            e.HasOne(t => t.ExamResult)
             .WithMany(r => r.TopicScores)
             .HasForeignKey(t => t.ExamResultId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
