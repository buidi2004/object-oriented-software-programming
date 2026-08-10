using MediatR;
using System;

namespace CloudServiceStore.Application.Features.NewsArticles.Commands.AddComment;

public class AddCommentCommand : IRequest<Guid>
{
    public Guid NewsArticleId { get; set; }
    public string Content { get; set; } = null!;
}
