using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Salgadin.Models;

namespace Salgadin.Data.Configurations;

public class UserWhatsAppAccountConfiguration : IEntityTypeConfiguration<UserWhatsAppAccount>
{
    public void Configure(EntityTypeBuilder<UserWhatsAppAccount> builder)
    {
        builder.HasKey(account => account.Id);

        builder.Property(account => account.PhoneNumber)
            .IsRequired()
            .HasMaxLength(32);

        builder.Property(account => account.WhatsAppId)
            .HasMaxLength(128);

        builder.Property(account => account.CreatedAt)
            .IsRequired();

        builder.HasOne(account => account.User)
            .WithMany()
            .HasForeignKey(account => account.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(account => account.UserId);
        builder.HasIndex(account => account.PhoneNumber);
    }
}
