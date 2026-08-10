using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Testimonials.Commands.FeatureTestimonial;

public class FeatureTestimonialCommandHandler : IRequestHandler<FeatureTestimonialCommand, bool>
{
    private readonly IRepository<Review> _repo;
    private readonly IUnitOfWork _uow;

    public FeatureTestimonialCommandHandler(IRepository<Review> repo, IUnitOfWork uow)
    {
        _repo = repo;
        _uow = uow;
    }

    public async Task<bool> Handle(FeatureTestimonialCommand request, CancellationToken cancellationToken)
    {
        var review = await _repo.GetByIdAsync(request.ReviewId, cancellationToken);
        if (review == null) throw new NotFoundException(nameof(Review), request.ReviewId);

        if (!review.IsApproved && request.IsFeatured)
        {
            throw new BadRequestException("Cannot feature an unapproved review.");
        }

        review.IsFeatured = request.IsFeatured;
        _repo.Update(review);
        await _uow.SaveChangesAsync(cancellationToken);

        return true;
    }
}
