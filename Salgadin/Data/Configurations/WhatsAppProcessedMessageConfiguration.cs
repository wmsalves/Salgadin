using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Salgadin.Models;

namespace Salgadin.Data.Configurations;

public class WhatsAppProcessedMessageConfiguration : IEntityTypeConfiguration<WhatsAppProcessedMessage>
{
    public void Configure(EntityTypeBuilder<WhatsAppProcessedMessage> builder)
    {
        builder.HasKey(message => message.Id);

        builder.Property(message => message.ProviderMessageId)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(message => message.PhoneNumber)
            .IsRequired()
            .HasMaxLength(32);

        builder.Property(message => message.ProcessedAt)
            .IsRequired();

        builder.HasOne(message => message.User)
            .WithMany()
            .HasForeignKey(message => message.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(message => message.ProviderMessageId).IsUnique();
        builder.HasIndex(message => message.PhoneNumber);
        builder.HasIndex(message => message.UserId);
    }
}
