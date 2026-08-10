using MediatR;
using System.Collections.Generic;

namespace CloudServiceStore.Application.Features.Settings.Queries.GetAllSettings;

public class GetAllSettingsQuery : IRequest<IEnumerable<SettingDto>>
{
}

public class SettingDto
{
    public string Key { get; set; } = null!;
    public string Value { get; set; } = null!;
}
