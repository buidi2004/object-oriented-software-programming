using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.Faqs.Commands.DeleteFaqItem;

public class DeleteFaqItemCommandHandler : IRequestHandler<DeleteFaqItemCommand, bool>
{
    private readonly IRepository<FaqItem> _faqRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteFaqItemCommandHandler(IRepository<FaqItem> faqRepository, IUnitOfWork unitOfWork)
    {
        _faqRepository = faqRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteFaqItemCommand request, CancellationToken cancellationToken)
    {
        var item = await _faqRepository.GetByIdAsync(request.Id);
        if (item == null)
            return false;

        _faqRepository.Delete(item);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
