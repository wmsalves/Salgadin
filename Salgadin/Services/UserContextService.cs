using System.Security.Claims;

namespace Salgadin.Services
{
    public interface IUserContextService
    {
        int GetUserId();
    }

    public class UserContextService : IUserContextService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserContextService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public int GetUserId()
        {
            var userId = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(userId, out var id) ? id : throw new UnauthorizedAccessException("Usuário não autenticado");
        }
    }
}
