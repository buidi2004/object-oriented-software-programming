using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.News.Commands.CreateArticle;

public class CreateNewsArticleCommandHandler : IRequestHandler<CreateNewsArticleCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<NewsArticle> _repo;
    private readonly ICurrentUserService _currentUser;

    public CreateNewsArticleCommandHandler(IUnitOfWork uow, IRepository<NewsArticle> repo, ICurrentUserService currentUser)
    {
        _uow = uow;
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateNewsArticleCommand request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Người dùng chưa đăng nhập.");

        if (await _repo.AnyAsync(a => a.Slug == request.Slug, ct))
            throw new ConflictException("Slug đã tồn tại.");

        var article = new NewsArticle
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Slug = request.Slug,
            Content = request.Content,
            AuthorId = userId,
            Status = ArticleStatus.Draft
        };

        await _repo.AddAsync(article, ct);
        await _uow.SaveChangesAsync(ct);

        return article.Id;
    }
}
