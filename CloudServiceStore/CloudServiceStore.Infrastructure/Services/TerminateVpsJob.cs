using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Application.Features.VpsInstances.Commands.TerminateVps;
using MediatR;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Infrastructure.Services;

public class TerminateVpsJob : ITerminateVpsJob
{
    private readonly ISender _sender;
    private readonly ILogger<TerminateVpsJob> _logger;

    public TerminateVpsJob(ISender sender, ILogger<TerminateVpsJob> logger)
    {
        _sender = sender;
        _logger = logger;
    }

    public async Task TerminateAsync(string containerId)
    {
        _logger.LogInformation("Hangfire Job: Terminating VPS {ContainerId}", containerId);
        await _sender.Send(new TerminateVpsCommand { ContainerId = containerId });
    }
}
