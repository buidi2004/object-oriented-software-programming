using System;
using FluentValidation;
using MediatR;

namespace CloudServiceStore.Application.Features.SystemSettings.Commands.UpdateSetting;

public record UpdateSettingCommand(string Key, string Value, string? Description) : IRequest;

public class UpdateSettingCommandValidator : AbstractValidator<UpdateSettingCommand>
{
    public UpdateSettingCommandValidator()
    {
        RuleFor(x => x.Key).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Value).NotEmpty();
    }
}
