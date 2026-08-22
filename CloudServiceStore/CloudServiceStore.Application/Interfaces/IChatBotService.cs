using System.Threading.Tasks;

namespace CloudServiceStore.Application.Interfaces;

public interface IChatBotService
{
    Task<string> AskAsync(string userMessage, string context);
}
