using System;
using MediatR;

namespace CloudServiceStore.Application.Features.RefundRequests.Commands.CreateRefundRequest;

public record CreateRefundRequestCommand(Guid OrderId, string Reason, decimal RefundAmount) : IRequest<Guid>;
