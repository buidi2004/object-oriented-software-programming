using System;
using MediatR;

namespace CloudServiceStore.Application.Features.RefundRequests.Commands.RejectRefundRequest;

public record RejectRefundRequestCommand(Guid Id) : IRequest<bool>;
