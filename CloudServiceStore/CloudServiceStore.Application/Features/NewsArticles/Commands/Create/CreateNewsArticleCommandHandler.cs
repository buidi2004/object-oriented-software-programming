using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.NewsArticles.Commands.Create;

public class CreateNewsArticleCommandHandler : IRequestHandler<CreateNewsArticleCommand, Guid>
{
    private readonly IRepository<NewsArticle> _newsRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateNewsArticleCommandHandler(IRepository<NewsArticle> newsRepository, IUnitOfWork unitOfWork)
    {
        _newsRepository = newsRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateNewsArticleCommand request, CancellationToken cancellationToken)
    {
        var article = new NewsArticle(
            request.Title,
            request.Slug,
            request.Content,
            request.AuthorId,
            request.ThumbnailUrl,
            request.Tags,
            request.Status
        );
        
        await _newsRepository.AddAsync(article);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return article.Id;
    }
}
