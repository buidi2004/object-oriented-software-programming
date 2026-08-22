using MediatR;
using CloudServiceStore.Application.Features.ServiceTags.DTOs;

namespace CloudServiceStore.Application.Features.ServiceTags.Queries;

public record GetServiceTagsQuery(Guid UserId) : IRequest<List<ServiceTagDto>>;

public class GetServiceTagsQueryHandler : IRequestHandler<GetServiceTagsQuery, List<ServiceTagDto>>
{
    public async Task<List<ServiceTagDto>> Handle(GetServiceTagsQuery request, CancellationToken cancellationToken)
    {
        var list = new List<ServiceTagDto>
        {
            new() { ServiceId = Guid.NewGuid(), ServiceType = "VPS", ServiceName = "VPS Pro 01", TagColor = "#ef4444", Note = "Dự án chính - không được tắt" },
            new() { ServiceId = Guid.NewGuid(), ServiceType = "Domain", ServiceName = "mywebsite.com", TagColor = "#22c55e", Note = "Domain khách hàng A" },
            new() { ServiceId = Guid.NewGuid(), ServiceType = "Hosting", ServiceName = "Hosting Basic", TagColor = "#3b82f6", Note = null }
        };
        await Task.CompletedTask;
        return list;
    }
}
