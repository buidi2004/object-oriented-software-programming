using MediatR;
using CloudServiceStore.Application.Features.FeatureRequests.DTOs;

namespace CloudServiceStore.Application.Features.FeatureRequests.Queries;

public record ListFeatureRequestsQuery(Guid UserId) : IRequest<List<FeatureRequestDto>>;

public class ListFeatureRequestsQueryHandler : IRequestHandler<ListFeatureRequestsQuery, List<FeatureRequestDto>>
{
    public async Task<List<FeatureRequestDto>> Handle(ListFeatureRequestsQuery request, CancellationToken cancellationToken)
    {
        var list = new List<FeatureRequestDto>
        {
            new() { Id = Guid.NewGuid(), Title = "Hỗ trợ thanh toán bằng Momo", Description = "Tích hợp ví Momo để thanh toán nhanh hơn.", Status = "Planned", Upvotes = 42, HasVoted = false, AuthorName = "nguyen_van_a", CreatedAt = DateTime.UtcNow.AddDays(-10) },
            new() { Id = Guid.NewGuid(), Title = "Dark mode cho dashboard", Description = "Giao diện tối giúp dễ nhìn về đêm.", Status = "InProgress", Upvotes = 87, HasVoted = true, AuthorName = "tran_thi_b", CreatedAt = DateTime.UtcNow.AddDays(-7) },
            new() { Id = Guid.NewGuid(), Title = "API lấy snapshot VPS", Description = "Tạo snapshot VPS qua API.", Status = "Pending", Upvotes = 15, HasVoted = false, AuthorName = "le_van_c", CreatedAt = DateTime.UtcNow.AddDays(-2) }
        };
        await Task.CompletedTask;
        return list;
    }
}
