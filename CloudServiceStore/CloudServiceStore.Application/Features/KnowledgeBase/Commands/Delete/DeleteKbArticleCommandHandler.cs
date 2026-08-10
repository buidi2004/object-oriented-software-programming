using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.KnowledgeBase.Commands.Delete;

public class DeleteKbArticleCommandHandler : IRequestHandler<DeleteKbArticleCommand, bool>
{
    private readonly IRepository<KnowledgeBaseArticle> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteKbArticleCommandHandler(IRepository<KnowledgeBaseArticle> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteKbArticleCommand request, CancellationToken cancellationToken)
    {
        var item = await _repository.GetByIdAsync(request.Id);
        if (item == null)
            return false;

        _repository.Delete(item);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
