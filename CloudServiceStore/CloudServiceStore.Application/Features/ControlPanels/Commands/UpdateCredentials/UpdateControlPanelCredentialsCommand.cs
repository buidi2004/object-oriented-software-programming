using System;
using MediatR;
using FluentValidation;

namespace CloudServiceStore.Application.Features.ControlPanels.Commands.UpdateCredentials;

public record UpdateControlPanelCredentialsCommand(Guid OrderId, string PanelType, string Url, string Username, string Password) : IRequest<Guid>;

public class UpdateControlPanelCredentialsCommandValidator : AbstractValidator<UpdateControlPanelCredentialsCommand>
{
    public UpdateControlPanelCredentialsCommandValidator()
    {
        RuleFor(v => v.OrderId).NotEmpty();
        RuleFor(v => v.PanelType).NotEmpty();
        RuleFor(v => v.Url).NotEmpty().Must(u => Uri.IsWellFormedUriString(u, UriKind.Absolute)).WithMessage("Must be a valid URL");
        RuleFor(v => v.Username).NotEmpty();
        RuleFor(v => v.Password).NotEmpty();
    }
}
