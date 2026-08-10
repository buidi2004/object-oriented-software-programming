using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.KnowledgeBase.Queries.GetById;

public class GetKbArticleByIdQueryHandler : IRequestHandler<GetKbArticleByIdQuery, KbArticleDto?>
{
    private readonly IRepository<KnowledgeBaseArticle> _kbRepository;

    public GetKbArticleByIdQueryHandler(IRepository<KnowledgeBaseArticle> kbRepository)
    {
        _kbRepository = kbRepository;
    }

    public async Task<KbArticleDto?> Handle(GetKbArticleByIdQuery request, CancellationToken cancellationToken)
    {
        var article = await _kbRepository.GetByIdAsync(request.Id);

        if (article == null)
            return null;

        return new KbArticleDto(
            article.Id,
            article.Title,
            article.Slug,
            article.Content,
            article.CategoryTag,
            article.ViewCount,
            article.IsPublished,
            article.AuthorId
        );
    }
}
