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
    private readonly CloudServiceStore.Application.Interfaces.ICurrentUserService _currentUserService;

    public CreateKbArticleCommandHandler(
        IRepository<KnowledgeBaseArticle> kbRepository,
        IUnitOfWork unitOfWork,
        CloudServiceStore.Application.Interfaces.ICurrentUserService currentUserService)
    {
        _kbRepository = kbRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(CreateKbArticleCommand request, CancellationToken cancellationToken)
    {
        var authorId = request.AuthorId != Guid.Empty 
            ? request.AuthorId 
            : (_currentUserService.UserId ?? Guid.Empty);

        var article = new KnowledgeBaseArticle(
            request.Title,
            request.Slug,
            request.Content,
            request.CategoryTag,
            authorId,
            request.IsPublished
        );
        
        await _kbRepository.AddAsync(article);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return article.Id;
    }
}
