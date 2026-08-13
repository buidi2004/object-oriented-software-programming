using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.SystemSettings.Queries.GetAllSettings;

public class GetAllSettingsQueryHandler : IRequestHandler<GetAllSettingsQuery, IReadOnlyList<SettingDto>>
{
    private readonly IRepository<SystemSetting> _repo;

    public GetAllSettingsQueryHandler(IRepository<SystemSetting> repo) => _repo = repo;

    public async Task<IReadOnlyList<SettingDto>> Handle(GetAllSettingsQuery request, CancellationToken ct)
    {
        var settings = await _repo.GetAllAsync(ct);
        return settings.Select(s => new SettingDto(s.Key, s.Value, s.Description)).ToList().AsReadOnly();
    }
}
