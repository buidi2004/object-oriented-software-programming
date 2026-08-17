using MediatR;

namespace CloudServiceStore.Application.Features.DedicatedServers.Commands.CreateDedicatedServer;

public record CreateDedicatedServerCommand(
    string ServerName,
    string CpuModel,
    int RamGb,
    long DiskBytes,
    string OsImage,
    DateTime ExpiresAt
) : IRequest<Guid>;
