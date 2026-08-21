using MediatR;
using CloudServiceStore.Application.Features.FeatureRequests.DTOs;

namespace CloudServiceStore.Application.Features.FeatureRequests.Commands;

public record CreateFeatureRequestCommand(Guid UserId, string Title, string Description) : IRequest<FeatureRequestDto>;

public class CreateFeatureRequestCommandHandler : IRequestHandler<CreateFeatureRequestCommand, FeatureRequestDto>
{
    public async Task<FeatureRequestDto> Handle(CreateFeatureRequestCommand request, CancellationToken cancellationToken)
    {
        await Task.CompletedTask;
        return new FeatureRequestDto
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Status = "Pending",
            Upvotes = 1,
            HasVoted = true,
            AuthorName = "Bạn",
            CreatedAt = DateTime.UtcNow
        };
    }
}
