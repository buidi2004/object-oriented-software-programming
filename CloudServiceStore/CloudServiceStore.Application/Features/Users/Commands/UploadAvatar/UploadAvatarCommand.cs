using MediatR;
using FluentValidation;

namespace CloudServiceStore.Application.Features.Users.Commands.UploadAvatar;

public record UploadAvatarCommand(string AvatarUrl) : IRequest;

public class UploadAvatarCommandValidator : AbstractValidator<UploadAvatarCommand>
{
    public UploadAvatarCommandValidator()
    {
        RuleFor(x => x.AvatarUrl).NotEmpty();
    }
}
