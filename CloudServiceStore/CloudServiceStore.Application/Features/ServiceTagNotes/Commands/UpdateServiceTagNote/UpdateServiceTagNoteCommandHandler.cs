using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.ServiceTagNotes.Commands.UpdateServiceTagNote;

public class UpdateServiceTagNoteCommandHandler : IRequestHandler<UpdateServiceTagNoteCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<ServiceTagNote> _repo;
    private readonly ICurrentUserService _currentUser;

    public UpdateServiceTagNoteCommandHandler(
        IUnitOfWork uow,
        IRepository<ServiceTagNote> repo,
        ICurrentUserService currentUser)
    {
        _uow = uow;
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task Handle(UpdateServiceTagNoteCommand request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Unauthorized");

        var normalizedType = request.ServiceType.Trim().ToUpperInvariant();
        var existing = await _repo.FirstOrDefaultAsync(
            x => x.UserId == userId && x.ServiceType == normalizedType && x.ServiceId == request.ServiceId,
            ct);

        if (existing == null)
        {
            await _repo.AddAsync(new ServiceTagNote
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ServiceType = normalizedType,
                ServiceId = request.ServiceId,
                TagsJson = request.TagsJson,
                ColorHex = request.ColorHex,
                Note = request.Note,
                UpdatedAt = DateTime.UtcNow
            }, ct);
        }
        else
        {
            existing.TagsJson = request.TagsJson;
            existing.ColorHex = request.ColorHex;
            existing.Note = request.Note;
            existing.UpdatedAt = DateTime.UtcNow;
            _repo.Update(existing);
        }

        await _uow.SaveChangesAsync(ct);
    }
}
