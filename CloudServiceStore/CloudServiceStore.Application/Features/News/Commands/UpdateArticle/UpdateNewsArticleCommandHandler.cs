using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.News.Commands.UpdateArticle;

public class UpdateNewsArticleCommandHandler : IRequestHandler<UpdateNewsArticleCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<NewsArticle> _repo;

    public UpdateNewsArticleCommandHandler(IUnitOfWork uow, IRepository<NewsArticle> repo)
    {
        _uow = uow;
        _repo = repo;
    }

    public async Task Handle(UpdateNewsArticleCommand request, CancellationToken ct)
    {
        var article = await _repo.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException($"Bài viết {request.Id} không tồn tại.");

        if (article.Slug != request.Slug && await _repo.AnyAsync(a => a.Slug == request.Slug, ct))
            throw new ConflictException("Slug đã tồn tại.");

        article.Update(
            title: request.Title,
            slug: request.Slug,
            content: request.Content,
            thumbnailUrl: article.ThumbnailUrl, // Keep existing if not in request
            tags: article.Tags,                 // Keep existing if not in request
            status: article.Status              // Keep existing if not in request
        );

        _repo.Update(article);
        await _uow.SaveChangesAsync(ct);
    }
}
