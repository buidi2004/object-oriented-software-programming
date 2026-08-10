using CloudServiceStore.Domain.Entities;
using MediatR;
using System.Collections.Generic;

namespace CloudServiceStore.Application.Features.KnowledgeBase.Queries.GetAll;

public record GetAllKbArticlesQuery() : IRequest<IEnumerable<KnowledgeBaseArticle>>;
