using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Salgadin.Models;

namespace Salgadin.Data.Configurations
{
    public class RecurringScheduleConfiguration : IEntityTypeConfiguration<RecurringSchedule>
    {
        public void Configure(EntityTypeBuilder<RecurringSchedule> builder)
        {
            builder.HasKey(item => item.Id);

            builder.Property(item => item.Type)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(item => item.Description)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(item => item.Amount)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            builder.Property(item => item.Frequency)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(item => item.Status)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(item => item.Source)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(item => item.StartDate).IsRequired();
            builder.Property(item => item.DayOfMonth).IsRequired();
            builder.Property(item => item.NextOccurrenceDate).IsRequired();
            builder.Property(item => item.CreatedAt).IsRequired();
            builder.Property(item => item.UpdatedAt).IsRequired();

            builder.HasOne(item => item.User)
                .WithMany()
                .HasForeignKey(item => item.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(item => item.Category)
                .WithMany()
                .HasForeignKey(item => item.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(item => item.Subcategory)
                .WithMany()
                .HasForeignKey(item => item.SubcategoryId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasIndex(item => new { item.UserId, item.Status });
            builder.HasIndex(item => new { item.UserId, item.NextOccurrenceDate });
        }
    }
}
