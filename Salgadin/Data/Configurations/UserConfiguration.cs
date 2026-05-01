using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Salgadin.Models;

namespace Salgadin.Data.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasKey(u => u.Id);

            builder.Property(u => u.Username)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(u => u.PhoneNumber)
                .HasMaxLength(20);

            builder.Property(u => u.GoogleSubjectId)
                .HasMaxLength(128);

            builder.Property(u => u.ExternalProvider)
                .HasMaxLength(32);

            builder.Property(u => u.AvatarUrl)
                .HasMaxLength(500);

            // Garante que o nome de usuário seja único em toda a tabela.
            builder.HasIndex(u => u.Username).IsUnique();
            builder.HasIndex(u => u.GoogleSubjectId).IsUnique();

            builder.Property(u => u.PasswordHash).IsRequired();
            builder.Property(u => u.PasswordSalt).IsRequired();
        }
    }
}
