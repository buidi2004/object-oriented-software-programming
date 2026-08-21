using MediatR;
using CloudServiceStore.Application.Features.ServiceTags.DTOs;

namespace CloudServiceStore.Application.Features.ServiceTags.Commands;

public record UpdateServiceTagCommand(Guid UserId, Guid ServiceId, string TagColor, string? Note) : IRequest<ServiceTagDto>;

public class UpdateServiceTagCommandHandler : IRequestHandler<UpdateServiceTagCommand, ServiceTagDto>
{
    public async Task<ServiceTagDto> Handle(UpdateServiceTagCommand request, CancellationToken cancellationToken)
    {
        await Task.CompletedTask;
        return new ServiceTagDto
        {
            ServiceId = request.ServiceId,
            ServiceType = "VPS",
            ServiceName = "VPS Pro 01",
            TagColor = request.TagColor,
            Note = request.Note
        };
    }
}
