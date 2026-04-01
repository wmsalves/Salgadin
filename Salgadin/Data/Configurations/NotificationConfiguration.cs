using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Salgadin.Models;

namespace Salgadin.Data.Configurations
{
    public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            builder.ToTable("Notifications");

            builder.HasKey(n => n.Id);

            builder.Property(n => n.Type)
                .HasMaxLength(60)
                .IsRequired();

            builder.Property(n => n.Title)
                .HasMaxLength(120)
                .IsRequired();

            builder.Property(n => n.Message)
                .HasMaxLength(300)
                .IsRequired();

            builder.Property(n => n.CreatedAt)
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            builder.Property(n => n.Threshold)
                .HasPrecision(6, 4);

            builder.Property(n => n.MonthlyLimit)
                .HasPrecision(12, 2);

            builder.Property(n => n.Spent)
                .HasPrecision(12, 2);

            builder.HasOne(n => n.User)
                .WithMany()
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(n => n.Category)
                .WithMany()
                .HasForeignKey(n => n.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(n => n.Goal)
                .WithMany()
                .HasForeignKey(n => n.GoalId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasIndex(n => new { n.UserId, n.GoalId, n.PeriodYear, n.PeriodMonth, n.Type })
                .IsUnique();
        }
    }
}
