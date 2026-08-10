using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.KnowledgeBase.Commands.Create;

public class CreateKbArticleCommandHandler : IRequestHandler<CreateKbArticleCommand, Guid>
{
    private readonly IRepository<KnowledgeBaseArticle> _kbRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateKbArticleCommandHandler(IRepository<KnowledgeBaseArticle> kbRepository, IUnitOfWork unitOfWork)
    {
        _kbRepository = kbRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateKbArticleCommand request, CancellationToken cancellationToken)
    {
        var article = new KnowledgeBaseArticle(
            request.Title,
            request.Slug,
            request.Content,
            request.CategoryTag,
            request.AuthorId,
            request.IsPublished
        );
        
        await _kbRepository.AddAsync(article);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return article.Id;
    }
}
