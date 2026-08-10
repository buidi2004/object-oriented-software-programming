using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Testimonials.Queries.GetTestimonials;

public class GetTestimonialsQueryHandler : IRequestHandler<GetTestimonialsQuery, IReadOnlyList<TestimonialDto>>
{
    private readonly IRepository<Review> _repo;

    public GetTestimonialsQueryHandler(IRepository<Review> repo)
    {
        _repo = repo;
    }

    public async Task<IReadOnlyList<TestimonialDto>> Handle(GetTestimonialsQuery request, CancellationToken cancellationToken)
    {
        var reviews = await _repo.WhereAsync(r => r.IsFeatured && r.IsApproved, cancellationToken);
        
        return reviews.Select(r => new TestimonialDto
        {
            Id = r.Id,
            ServicePlanId = r.ServicePlanId,
            ReviewerName = r.User?.FullName ?? "Unknown", // Assuming user is included in query via EF or eager loading. 
            Rating = r.Rating,
            Comment = r.Comment,
            CreatedAt = r.CreatedAt
        }).OrderByDescending(x => x.CreatedAt).ToList();
    }
}
