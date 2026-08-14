using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.News.Commands.DeleteArticle;

public class DeleteNewsArticleCommandHandler : IRequestHandler<DeleteNewsArticleCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<NewsArticle> _repo;
    private readonly IRepository<ArticleComment> _commentRepo;

    public DeleteNewsArticleCommandHandler(
        IUnitOfWork uow,
        IRepository<NewsArticle> repo,
        IRepository<ArticleComment> commentRepo)
    {
        _uow = uow;
        _repo = repo;
        _commentRepo = commentRepo;
    }

    public async Task Handle(DeleteNewsArticleCommand request, CancellationToken ct)
    {
        var article = await _repo.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException($"Bài viết {request.Id} không tồn tại.");

        var comments = await _commentRepo.WhereAsync(c => c.ArticleId == request.Id, ct);
        foreach (var comment in comments)
        {
            _commentRepo.Delete(comment);
        }

        _repo.Delete(article);
        await _uow.SaveChangesAsync(ct);
    }
}
