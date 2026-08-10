using System.Collections.Generic;
using CloudServiceStore.Application.DTOs;
using MediatR;

namespace CloudServiceStore.Application.Features.Testimonials.Queries.GetTestimonials;

public class GetTestimonialsQuery : IRequest<IReadOnlyList<TestimonialDto>> { }
