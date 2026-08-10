using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.Faqs.Queries.GetAllFaqs;

public class GetAllFaqsQueryHandler : IRequestHandler<GetAllFaqsQuery, IEnumerable<FaqDto>>
{
    private readonly IRepository<FaqItem> _faqRepository;

    public GetAllFaqsQueryHandler(IRepository<FaqItem> faqRepository)
    {
        _faqRepository = faqRepository;
    }

    public async Task<IEnumerable<FaqDto>> Handle(GetAllFaqsQuery request, CancellationToken cancellationToken)
    {
        var faqs = await _faqRepository.GetAllAsync();

        return faqs
            .OrderBy(f => f.DisplayOrder)
            .Select(f => new FaqDto(f.Id, f.Question, f.Answer, f.CategoryTag, f.DisplayOrder))
            .ToList();
    }
}
