using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.SystemSettings.Queries.GetAllSettings;

public record SettingDto(string Key, string Value, string? Description);

public record GetAllSettingsQuery() : IRequest<IReadOnlyList<SettingDto>>;
