namespace Salgadin.Exceptions
{
    // Representa erros causados por dados de entrada inválidos fornecidos pelo cliente.
    public class BadInputException : Exception
    {
        public BadInputException(string message) : base(message) { }
    }
}