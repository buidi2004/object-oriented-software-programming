using MediatR;

namespace CloudServiceStore.Application.Features.AutoRenew.Commands.ProcessAutoRenewals;

public record ProcessAutoRenewalsCommand() : IRequest<int>;
