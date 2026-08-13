using System;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.WebApi.Hubs;

// [Authorize] // Commented out for easier local testing, in production should be enabled
public class VpsTerminalHub : Hub
{
    private readonly IVpsProvisioningService _provisioningService;
    private readonly ILogger<VpsTerminalHub> _logger;

    public VpsTerminalHub(IVpsProvisioningService provisioningService, ILogger<VpsTerminalHub> logger)
    {
        _provisioningService = provisioningService;
        _logger = logger;
    }

    public async Task SendCommand(string containerId, string command)
    {
        try
        {
            // Note: In production, verify that Context.User owns this containerId here

            _logger.LogInformation("Executing command on {ContainerId}", containerId);
            var result = await _provisioningService.ExecCommandAsync(containerId, command, Context.ConnectionAborted);
            
            await Clients.Caller.SendAsync("ReceiveOutput", result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing command via SignalR");
            await Clients.Caller.SendAsync("ReceiveOutput", $"\r\nError: {ex.Message}\r\n");
        }
    }
}
