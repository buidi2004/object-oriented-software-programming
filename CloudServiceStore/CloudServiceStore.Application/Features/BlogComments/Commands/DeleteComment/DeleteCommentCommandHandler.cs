using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.BlogComments.Commands.DeleteComment;

public class DeleteCommentCommandHandler : IRequestHandler<DeleteCommentCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<ArticleComment> _commentRepo;
    private readonly ICurrentUserService _currentUser;

    public DeleteCommentCommandHandler(IUnitOfWork uow, IRepository<ArticleComment> commentRepo, ICurrentUserService currentUser)
    {
        _uow = uow;
        _commentRepo = commentRepo;
        _currentUser = currentUser;
    }

    public async Task Handle(DeleteCommentCommand request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Người dùng chưa đăng nhập.");

        var comment = await _commentRepo.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException($"Bình luận {request.Id} không tồn tại.");

        if (comment.UserId != userId)
            throw new UnauthorizedException("Không có quyền xoá bình luận của người khác.");

        _commentRepo.Delete(comment);
        await _uow.SaveChangesAsync(ct);
    }
}
