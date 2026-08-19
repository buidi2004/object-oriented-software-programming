using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Resources.Commands.TrackResourceDownload;

public class TrackResourceDownloadCommandHandler : IRequestHandler<TrackResourceDownloadCommand, int>
{
    private readonly IRepository<DownloadableResource> _repo;
    private readonly IUnitOfWork _uow;

    public TrackResourceDownloadCommandHandler(IRepository<DownloadableResource> repo, IUnitOfWork uow)
    {
        _repo = repo;
        _uow = uow;
    }

    public async Task<int> Handle(TrackResourceDownloadCommand request, CancellationToken ct)
    {
        var resource = await _repo.GetByIdAsync(request.ResourceId, ct)
            ?? throw new NotFoundException("Resource not found.");

        resource.DownloadCount += 1;
        _repo.Update(resource);
        await _uow.SaveChangesAsync(ct);

        return resource.DownloadCount;
    }
}
