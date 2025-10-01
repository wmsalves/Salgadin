namespace Salgadin.Exceptions
{
    // Representa um erro quando um recurso específico não pôde ser encontrado.
    public class NotFoundException : Exception
    {
        public NotFoundException(string message) : base(message) { }
    }
}