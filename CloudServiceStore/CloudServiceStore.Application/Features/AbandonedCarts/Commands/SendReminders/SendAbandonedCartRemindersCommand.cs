using MediatR;

namespace CloudServiceStore.Application.Features.AbandonedCarts.Commands.SendReminders;

public record SendAbandonedCartRemindersCommand() : IRequest<int>;
