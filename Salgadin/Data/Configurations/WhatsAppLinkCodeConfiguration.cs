using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Salgadin.Models;

namespace Salgadin.Data.Configurations;

public class WhatsAppLinkCodeConfiguration : IEntityTypeConfiguration<WhatsAppLinkCode>
{
    public void Configure(EntityTypeBuilder<WhatsAppLinkCode> builder)
    {
        builder.HasKey(linkCode => linkCode.Id);

        builder.Property(linkCode => linkCode.Code)
            .IsRequired()
            .HasMaxLength(32);

        builder.Property(linkCode => linkCode.CreatedAt)
            .IsRequired();

        builder.Property(linkCode => linkCode.ExpiresAt)
            .IsRequired();

        builder.HasOne(linkCode => linkCode.User)
            .WithMany()
            .HasForeignKey(linkCode => linkCode.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(linkCode => linkCode.Code).IsUnique();
        builder.HasIndex(linkCode => linkCode.UserId);
    }
}
