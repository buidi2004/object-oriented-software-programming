using MediatR;
using System.Collections.Generic;

namespace CloudServiceStore.Application.Features.Faqs.Queries.GetAllFaqs;

public record GetAllFaqsQuery() : IRequest<IEnumerable<FaqDto>>;
