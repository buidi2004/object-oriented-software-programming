using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.Settings.Queries.GetAllSettings;

public class GetAllSettingsQueryHandler : IRequestHandler<GetAllSettingsQuery, IEnumerable<SettingDto>>
{
    private readonly IRepository<SystemSetting> _repository;

    public GetAllSettingsQueryHandler(IRepository<SystemSetting> repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<SettingDto>> Handle(GetAllSettingsQuery request, CancellationToken cancellationToken)
    {
        var settings = await _repository.GetAllAsync(cancellationToken);
        
        return settings.Select(s => new SettingDto
        {
            Key = s.Key,
            Value = s.Value
        }).ToList();
    }
}
