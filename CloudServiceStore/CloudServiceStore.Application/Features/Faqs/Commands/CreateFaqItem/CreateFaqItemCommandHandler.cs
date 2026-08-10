using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.Faqs.Commands.CreateFaqItem;

public class CreateFaqItemCommandHandler : IRequestHandler<CreateFaqItemCommand, Guid>
{
    private readonly IRepository<FaqItem> _faqRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateFaqItemCommandHandler(IRepository<FaqItem> faqRepository, IUnitOfWork unitOfWork)
    {
        _faqRepository = faqRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateFaqItemCommand request, CancellationToken cancellationToken)
    {
        var faq = new FaqItem(request.Question, request.Answer, request.CategoryTag, request.DisplayOrder);
        
        await _faqRepository.AddAsync(faq);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return faq.Id;
    }
}
