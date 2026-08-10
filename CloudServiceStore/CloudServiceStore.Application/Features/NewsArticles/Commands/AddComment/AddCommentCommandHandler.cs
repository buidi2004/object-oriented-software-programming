using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.NewsArticles.Commands.AddComment;

public class AddCommentCommandHandler : IRequestHandler<AddCommentCommand, Guid>
{
    private readonly IRepository<ArticleComment> _commentRepository;
    private readonly IRepository<NewsArticle> _articleRepository;
    private readonly ICurrentUserService _currentUserService;

    public AddCommentCommandHandler(IRepository<ArticleComment> commentRepository, IRepository<NewsArticle> articleRepository, ICurrentUserService currentUserService)
    {
        _commentRepository = commentRepository;
        _articleRepository = articleRepository;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(AddCommentCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
            throw new UnauthorizedAccessException();

        var article = await _articleRepository.GetByIdAsync(request.NewsArticleId, cancellationToken);
        if (article == null)
            throw new Exception("Article not found");

        var comment = new ArticleComment(request.NewsArticleId, _currentUserService.UserId.Value, request.Content);
        
        await _commentRepository.AddAsync(comment, cancellationToken);
        
        return comment.Id;
    }
}
