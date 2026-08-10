using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Testimonials.Commands.FeatureTestimonial;

public class FeatureTestimonialCommand : IRequest<bool>
{
    public Guid ReviewId { get; set; }
    public bool IsFeatured { get; set; }
}
