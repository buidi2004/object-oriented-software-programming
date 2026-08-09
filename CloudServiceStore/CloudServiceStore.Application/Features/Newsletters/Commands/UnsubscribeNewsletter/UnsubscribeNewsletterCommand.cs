using MediatR;

namespace CloudServiceStore.Application.Features.Newsletters.Commands.UnsubscribeNewsletter;

public class UnsubscribeNewsletterCommand : IRequest<bool>
{
    public string Email { get; set; } = null!;
}
