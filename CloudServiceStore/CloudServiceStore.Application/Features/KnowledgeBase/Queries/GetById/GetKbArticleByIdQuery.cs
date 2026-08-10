using MediatR;
using System;

namespace CloudServiceStore.Application.Features.KnowledgeBase.Queries.GetById;

public record GetKbArticleByIdQuery(Guid Id) : IRequest<KbArticleDto>;
