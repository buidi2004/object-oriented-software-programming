using MediatR;

namespace CloudServiceStore.Application.Features.EmailHosting.Commands.CreateEmailAccount;

public record CreateEmailAccountCommand(
    Guid HostingAccountId,
    string EmailLocalPart,
    string Domain,
    int QuotaMb
) : IRequest<Guid>;
