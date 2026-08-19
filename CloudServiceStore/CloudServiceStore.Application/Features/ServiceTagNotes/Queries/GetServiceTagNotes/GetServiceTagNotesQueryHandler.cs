using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.ServiceTagNotes.Queries.GetServiceTagNotes;

public class GetServiceTagNotesQueryHandler : IRequestHandler<GetServiceTagNotesQuery, ServiceTagNoteDto?>
{
    private readonly IRepository<ServiceTagNote> _repo;
    private readonly ICurrentUserService _currentUser;

    public GetServiceTagNotesQueryHandler(IRepository<ServiceTagNote> repo, ICurrentUserService currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<ServiceTagNoteDto?> Handle(GetServiceTagNotesQuery request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Unauthorized");
        var normalizedType = request.ServiceType.Trim().ToUpperInvariant();

        var found = await _repo.FirstOrDefaultAsync(
            x => x.UserId == userId && x.ServiceType == normalizedType && x.ServiceId == request.ServiceId,
            ct);

        if (found == null)
        {
            return null;
        }

        return new ServiceTagNoteDto(
            found.ServiceType,
            found.ServiceId,
            found.TagsJson,
            found.ColorHex,
            found.Note,
            found.UpdatedAt);
    }
}
