using System.Threading.Tasks;

namespace CloudServiceStore.Application.Interfaces;

public interface ITerminateVpsJob
{
    Task TerminateAsync(string containerId);
}
