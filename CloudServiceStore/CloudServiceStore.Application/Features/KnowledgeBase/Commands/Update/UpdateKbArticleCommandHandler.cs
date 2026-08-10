using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.KnowledgeBase.Commands.Update;

public class UpdateKbArticleCommandHandler : IRequestHandler<UpdateKbArticleCommand, bool>
{
    private readonly IRepository<KnowledgeBaseArticle> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateKbArticleCommandHandler(IRepository<KnowledgeBaseArticle> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(UpdateKbArticleCommand request, CancellationToken cancellationToken)
    {
        var item = await _repository.GetByIdAsync(request.Id);
        if (item == null)
            return false;

        item.Update(request.Title, request.Slug, request.Content, request.CategoryTag, request.IsPublished);

        _repository.Update(item);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
