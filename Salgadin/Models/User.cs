namespace Salgadin.Models
{
    public class User : IEntity
    {
        public int Id { get; set; }

        public string Username { get; set; } = string.Empty;

        public byte[] PasswordHash { get; set; } = null!;

        public byte[] PasswordSalt { get; set; } = null!;

        public ICollection<Expense>? Expenses { get; set; }

        public ICollection<Category>? Categories { get; set; }
    }
}