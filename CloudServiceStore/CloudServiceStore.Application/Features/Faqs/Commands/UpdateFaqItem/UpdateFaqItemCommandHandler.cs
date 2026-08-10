using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.Faqs.Commands.UpdateFaqItem;

public class UpdateFaqItemCommandHandler : IRequestHandler<UpdateFaqItemCommand, bool>
{
    private readonly IRepository<FaqItem> _faqRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateFaqItemCommandHandler(IRepository<FaqItem> faqRepository, IUnitOfWork unitOfWork)
    {
        _faqRepository = faqRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(UpdateFaqItemCommand request, CancellationToken cancellationToken)
    {
        var item = await _faqRepository.GetByIdAsync(request.Id);
        if (item == null)
            return false;

        item.Update(request.Question, request.Answer, request.CategoryTag, request.DisplayOrder);

        _faqRepository.Update(item);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
