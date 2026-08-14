using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Affiliates.Commands.Reject;

public record RejectAffiliateCommand(Guid ApplicationId) : IRequest;
