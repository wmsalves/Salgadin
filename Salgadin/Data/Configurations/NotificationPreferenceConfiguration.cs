using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Salgadin.Models;

namespace Salgadin.Data.Configurations
{
    public class NotificationPreferenceConfiguration : IEntityTypeConfiguration<NotificationPreference>
    {
        public void Configure(EntityTypeBuilder<NotificationPreference> builder)
        {
            builder.HasKey(p => p.Id);

            builder.Property(p => p.EmailEnabled)
                .IsRequired();

            builder.Property(p => p.PushEnabled)
                .IsRequired();

            builder.Property(p => p.MinimumThreshold)
                .IsRequired()
                .HasColumnType("decimal(5,4)");

            builder.HasOne(p => p.User)
                .WithOne(u => u.NotificationPreference)
                .HasForeignKey<NotificationPreference>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(p => p.UserId).IsUnique();
        }
    }
}
