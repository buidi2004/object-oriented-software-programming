using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.BlogComments.Queries.GetCommentsByArticle;

public record CommentDto(Guid Id, Guid UserId, string Content, DateTime CreatedAt);

public record GetCommentsByArticleQuery(Guid ArticleId) : IRequest<IReadOnlyList<CommentDto>>;
