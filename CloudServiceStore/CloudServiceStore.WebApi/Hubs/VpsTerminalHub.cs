using System;
using System.Linq;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.WebApi.Hubs;

[Authorize]
public class VpsTerminalHub : Hub
{
    private readonly IVpsProvisioningService _provisioningService;
    private readonly IRepository<Domain.Entities.VpsInstance> _vpsRepo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<VpsTerminalHub> _logger;

    private static readonly string[] BlockedPatterns =
    [
        "rm -rf /",
        "mkfs",
        ":(){ :|:& };:",
        "curl | bash",
        "wget | bash"
    ];

    public VpsTerminalHub(
        IVpsProvisioningService provisioningService,
        IRepository<Domain.Entities.VpsInstance> vpsRepo,
        IUnitOfWork uow,
        ICurrentUserService currentUserService,
        ILogger<VpsTerminalHub> logger)
    {
        _provisioningService = provisioningService;
        _vpsRepo = vpsRepo;
        _uow = uow;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task SendCommand(string containerId, string command)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(containerId) || string.IsNullOrWhiteSpace(command))
            {
                await Clients.Caller.SendAsync("ReceiveOutput", "Error: containerId and command are required.");
                return;
            }

            if (IsBlockedCommand(command))
            {
                await Clients.Caller.SendAsync("ReceiveOutput", "Error: command is blocked for safety.");
                return;
            }

            var instances = await _vpsRepo.GetAllAsync(Context.ConnectionAborted);
            var instance = instances.FirstOrDefault(x => x.ContainerId == containerId);
            if (instance == null)
            {
                await Clients.Caller.SendAsync("ReceiveOutput", "Error: VPS instance not found.");
                return;
            }

            instance.LastActiveAt = DateTime.UtcNow;
            _vpsRepo.Update(instance);
            await _uow.SaveChangesAsync(Context.ConnectionAborted);

            if (_currentUserService.UserId.HasValue
                && instance.UserId != _currentUserService.UserId.Value
                && !_currentUserService.IsInRole("Admin"))
            {
                await Clients.Caller.SendAsync("ReceiveOutput", "Error: unauthorized.");
                return;
            }

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

    private static bool IsBlockedCommand(string command)
    {
        var normalized = command.ToLowerInvariant();
        return BlockedPatterns.Any(pattern => normalized.Contains(pattern, StringComparison.Ordinal));
    }
}
