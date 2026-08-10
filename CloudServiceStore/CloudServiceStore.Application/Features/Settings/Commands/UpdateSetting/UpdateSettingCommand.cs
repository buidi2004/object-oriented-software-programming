using MediatR;

namespace CloudServiceStore.Application.Features.Settings.Commands.UpdateSetting;

public class UpdateSettingCommand : IRequest<bool>
{
    public string Key { get; set; } = null!;
    public string Value { get; set; } = null!;
}
