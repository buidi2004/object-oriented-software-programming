using MediatR;

namespace CloudServiceStore.Application.Features.HostingAccounts.Commands.CreateHostingAccount;

public record CreateHostingAccountCommand(Guid PlanId) : IRequest<Guid>;
