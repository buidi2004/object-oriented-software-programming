using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Newsletters.Commands.SubscribeNewsletter;

public class SubscribeNewsletterCommand : IRequest<bool>
{
    public string Email { get; set; } = null!;
}
