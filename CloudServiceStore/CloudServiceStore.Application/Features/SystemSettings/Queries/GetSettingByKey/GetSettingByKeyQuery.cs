using MediatR;

namespace CloudServiceStore.Application.Features.SystemSettings.Queries.GetSettingByKey;

public record GetSettingByKeyQuery(string Key) : IRequest<string?>;
