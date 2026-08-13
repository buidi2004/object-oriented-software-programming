using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Reviews.Commands.ApproveReview;

public class ApproveReviewCommandHandler : IRequestHandler<ApproveReviewCommand, bool>
{
    private readonly IRepository<Review> _repo;
    private readonly IUnitOfWork _uow;

    public ApproveReviewCommandHandler(IRepository<Review> repo, IUnitOfWork uow)
    {
        _repo = repo;
        _uow = uow;
    }

    public async Task<bool> Handle(ApproveReviewCommand request, CancellationToken cancellationToken)
    {
        var review = await _repo.GetByIdAsync(request.ReviewId, cancellationToken)
            ?? throw new NotFoundException(nameof(Review), request.ReviewId);

        review.IsApproved = true;
        _repo.Update(review);
        await _uow.SaveChangesAsync(cancellationToken);

        return true;
    }
}
