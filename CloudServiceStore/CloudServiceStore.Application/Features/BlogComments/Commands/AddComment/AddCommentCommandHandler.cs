using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.BlogComments.Commands.AddComment;

public class AddCommentCommandHandler : IRequestHandler<AddCommentCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<ArticleComment> _commentRepo;
    private readonly IRepository<NewsArticle> _articleRepo;
    private readonly ICurrentUserService _currentUser;

    public AddCommentCommandHandler(
        IUnitOfWork uow, 
        IRepository<ArticleComment> commentRepo, 
        IRepository<NewsArticle> articleRepo, 
        ICurrentUserService currentUser)
    {
        _uow = uow;
        _commentRepo = commentRepo;
        _articleRepo = articleRepo;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(AddCommentCommand request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Người dùng chưa đăng nhập.");

        var article = await _articleRepo.GetByIdAsync(request.ArticleId, ct)
            ?? throw new NotFoundException($"Bài viết {request.ArticleId} không tồn tại.");

        if (article.Status != Domain.Enums.ArticleStatus.Published)
            throw new BadRequestException("Không thể bình luận trên bài viết chưa xuất bản.");

        var comment = new ArticleComment
        {
            Id = Guid.NewGuid(),
            NewsArticleId = request.ArticleId,
            UserId = userId,
            Content = request.Content,
            CreatedAt = DateTime.UtcNow
        };

        await _commentRepo.AddAsync(comment, ct);
        await _uow.SaveChangesAsync(ct);

        return comment.Id;
    }
}
