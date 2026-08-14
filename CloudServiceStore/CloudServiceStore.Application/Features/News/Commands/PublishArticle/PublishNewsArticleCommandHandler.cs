using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.News.Commands.PublishArticle;

public class PublishNewsArticleCommandHandler : IRequestHandler<PublishNewsArticleCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<NewsArticle> _repo;

    public PublishNewsArticleCommandHandler(IUnitOfWork uow, IRepository<NewsArticle> repo)
    {
        _uow = uow;
        _repo = repo;
    }

    public async Task Handle(PublishNewsArticleCommand request, CancellationToken ct)
    {
        var article = await _repo.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException($"Bài viết {request.Id} không tồn tại.");

        article.Status = ArticleStatus.Published;

        _repo.Update(article);
        await _uow.SaveChangesAsync(ct);
    }
}
