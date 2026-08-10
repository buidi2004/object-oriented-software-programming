using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.KnowledgeBase.Commands.IncrementViewCount;

public class IncrementKbArticleViewCountCommandHandler : IRequestHandler<IncrementKbArticleViewCountCommand, bool>
{
    private readonly IRepository<KnowledgeBaseArticle> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public IncrementKbArticleViewCountCommandHandler(IRepository<KnowledgeBaseArticle> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(IncrementKbArticleViewCountCommand request, CancellationToken cancellationToken)
    {
        var item = await _repository.GetByIdAsync(request.Id);
        if (item == null)
            return false;

        item.IncrementViewCount();

        _repository.Update(item);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
