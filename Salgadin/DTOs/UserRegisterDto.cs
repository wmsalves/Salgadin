using System.ComponentModel.DataAnnotations;

namespace Salgadin.DTOs
{
    public class UserRegisterDto
    {
        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
