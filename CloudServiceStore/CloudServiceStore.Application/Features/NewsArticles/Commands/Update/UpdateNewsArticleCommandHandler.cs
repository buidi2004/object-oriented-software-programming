using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.NewsArticles.Commands.Update;

public class UpdateNewsArticleCommandHandler : IRequestHandler<UpdateNewsArticleCommand, bool>
{
    private readonly IRepository<NewsArticle> _newsRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateNewsArticleCommandHandler(IRepository<NewsArticle> newsRepository, IUnitOfWork unitOfWork)
    {
        _newsRepository = newsRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(UpdateNewsArticleCommand request, CancellationToken cancellationToken)
    {
        var article = await _newsRepository.GetByIdAsync(request.Id);
        if (article == null)
            return false;

        article.Update(
            request.Title,
            request.Slug,
            request.Content,
            request.ThumbnailUrl,
            request.Tags,
            request.Status
        );

        _newsRepository.Update(article);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
