using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.SystemSettings.Queries.GetSettingByKey;

public class GetSettingByKeyQueryHandler : IRequestHandler<GetSettingByKeyQuery, string?>
{
    private readonly IRepository<SystemSetting> _repo;

    public GetSettingByKeyQueryHandler(IRepository<SystemSetting> repo) => _repo = repo;

    public async Task<string?> Handle(GetSettingByKeyQuery request, CancellationToken ct)
    {
        var setting = await _repo.FirstOrDefaultAsync(s => s.Key == request.Key, ct);
        return setting?.Value;
    }
}
