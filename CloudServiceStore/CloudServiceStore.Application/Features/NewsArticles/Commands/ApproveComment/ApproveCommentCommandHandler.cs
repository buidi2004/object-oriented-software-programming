using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.NewsArticles.Commands.ApproveComment;

public class ApproveCommentCommandHandler : IRequestHandler<ApproveCommentCommand, bool>
{
    private readonly IRepository<ArticleComment> _repository;

    public ApproveCommentCommandHandler(IRepository<ArticleComment> repository)
    {
        _repository = repository;
    }

    public async Task<bool> Handle(ApproveCommentCommand request, CancellationToken cancellationToken)
    {
        var comment = await _repository.GetByIdAsync(request.CommentId, cancellationToken);
        if (comment == null)
            return false;

        comment.Approve();
        
        _repository.Update(comment);
        
        return true;
    }
}
