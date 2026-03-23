using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Salgadin.Models;

namespace Salgadin.Data.Configurations
{
    public class BudgetGoalConfiguration : IEntityTypeConfiguration<BudgetGoal>
    {
        public void Configure(EntityTypeBuilder<BudgetGoal> builder)
        {
            builder.HasKey(g => g.Id);

            builder.Property(g => g.MonthlyLimit)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            builder.Property(g => g.AlertThreshold)
                .IsRequired()
                .HasColumnType("decimal(5,4)");

            builder.Property(g => g.IsActive)
                .IsRequired();

            builder.HasOne(g => g.User)
                .WithMany(u => u.BudgetGoals)
                .HasForeignKey(g => g.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(g => g.Category)
                .WithMany()
                .HasForeignKey(g => g.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasIndex(g => g.UserId);
        }
    }
}
