using MediatR;
using System;

namespace CloudServiceStore.Application.Features.NewsArticles.Commands.ApproveComment;

public class ApproveCommentCommand : IRequest<bool>
{
    public Guid CommentId { get; set; }

    public ApproveCommentCommand(Guid commentId)
    {
        CommentId = commentId;
    }
}
