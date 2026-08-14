using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.Faqs.Commands.CreateFaqItem;

public class CreateFaqItemCommandHandler : IRequestHandler<CreateFaqItemCommand, Guid>
{
    private readonly IRepository<FaqItem> _faqRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICatalogCache _catalogCache;

    public CreateFaqItemCommandHandler(
        IRepository<FaqItem> faqRepository,
        IUnitOfWork unitOfWork,
        ICatalogCache catalogCache)
    {
        _faqRepository = faqRepository;
        _unitOfWork = unitOfWork;
        _catalogCache = catalogCache;
    }

    public async Task<Guid> Handle(CreateFaqItemCommand request, CancellationToken cancellationToken)
    {
        var faq = new FaqItem(request.Question, request.Answer, request.CategoryTag, request.DisplayOrder);
        
        await _faqRepository.AddAsync(faq);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await _catalogCache.InvalidateCatalogAsync(cancellationToken);

        return faq.Id;
    }
}
