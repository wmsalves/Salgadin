using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Salgadin.Models;

namespace Salgadin.Data.Configurations
{
    public class IncomeConfiguration : IEntityTypeConfiguration<Income>
    {
        public void Configure(EntityTypeBuilder<Income> builder)
        {
            builder.HasKey(i => i.Id);

            builder.Property(i => i.Description)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(i => i.Amount)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            builder.Property(i => i.Date)
                .IsRequired();

            builder.Property(i => i.IsFixed)
                .IsRequired()
                .HasDefaultValue(false);

            builder.HasOne(i => i.User)
                .WithMany(u => u.Incomes)
                .HasForeignKey(i => i.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
