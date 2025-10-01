using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Salgadin.Models;

namespace Salgadin.Data.Configurations
{
    public class ExpenseConfiguration : IEntityTypeConfiguration<Expense>
    {
        public void Configure(EntityTypeBuilder<Expense> builder)
        {
            // Define a chave primária da tabela.
            builder.HasKey(e => e.Id);

            // Configura a propriedade Description.
            builder.Property(e => e.Description)
                .IsRequired()
                .HasMaxLength(100);

            // Configura a propriedade Amount para ter uma precisão específica no banco.
            // Essencial para valores monetários para evitar erros de arredondamento.
            builder.Property(e => e.Amount)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            // Configura o relacionamento "uma Despesa pertence a um Usuário".
            builder.HasOne(e => e.User)
                .WithMany(u => u.Expenses) // Um Usuário tem muitas Despesas.
                .HasForeignKey(e => e.UserId) // A chave estrangeira é UserId.
                .OnDelete(DeleteBehavior.Cascade); // Se um usuário for deletado, suas despesas também serão.

            // Configura o relacionamento "uma Despesa pertence a uma Categoria".
            builder.HasOne(e => e.Category)
                .WithMany(c => c.Expenses) // Uma Categoria tem muitas Despesas.
                .HasForeignKey(e => e.CategoryId) // A chave estrangeira é CategoryId.
                .OnDelete(DeleteBehavior.Restrict); // Impede que uma categoria seja deletada se houver despesas associadas a ela.

            // Cria um índice na coluna UserId para otimizar consultas que filtram por usuário.
            builder.HasIndex(e => e.UserId);
        }
    }
}