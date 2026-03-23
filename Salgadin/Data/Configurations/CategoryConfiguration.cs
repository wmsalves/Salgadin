using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Salgadin.Models;

namespace Salgadin.Data.Configurations
{
    public class CategoryConfiguration : IEntityTypeConfiguration<Category>
    {
        public void Configure(EntityTypeBuilder<Category> builder)
        {
            builder.HasKey(c => c.Id);

            builder.Property(c => c.Name)
                .IsRequired()
                .HasMaxLength(50);

            // Configura o relacionamento "uma Categoria pertence a um Usuário".
            builder.HasOne(c => c.User)
                .WithMany(u => u.Categories)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade); // Se um usuário for deletado, suas categorias também serão.

            // Configura o relacionamento "uma Categoria tem muitas Subcategorias".
            builder.HasMany(c => c.Subcategories)
                .WithOne(sc => sc.Category)
                .HasForeignKey(sc => sc.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);

            // Cria um índice composto para garantir que um usuário não possa ter
            // duas categorias com o mesmo nome (ignorando maiúsculas/minúsculas no nível da aplicação/banco).
            builder.HasIndex(c => new { c.UserId, c.Name }).IsUnique();
        }
    }
}
