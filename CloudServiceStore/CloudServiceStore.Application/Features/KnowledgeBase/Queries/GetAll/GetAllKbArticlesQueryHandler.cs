using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.KnowledgeBase.Queries.GetAll;

public class GetAllKbArticlesQueryHandler : IRequestHandler<GetAllKbArticlesQuery, IEnumerable<KnowledgeBaseArticle>>
{
    private readonly IRepository<KnowledgeBaseArticle> _repository;

    public GetAllKbArticlesQueryHandler(IRepository<KnowledgeBaseArticle> repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<KnowledgeBaseArticle>> Handle(GetAllKbArticlesQuery request, CancellationToken cancellationToken)
    {
        return await _repository.GetAllAsync(cancellationToken);
    }
}
