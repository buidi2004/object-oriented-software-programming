using MediatR;

namespace CloudServiceStore.Application.Features.FeatureRequests.Commands;

public record VoteFeatureRequestCommand(Guid UserId, Guid FeatureRequestId) : IRequest<bool>;

public class VoteFeatureRequestCommandHandler : IRequestHandler<VoteFeatureRequestCommand, bool>
{
    public async Task<bool> Handle(VoteFeatureRequestCommand request, CancellationToken cancellationToken)
    {
        await Task.CompletedTask;
        return true;
    }
}
