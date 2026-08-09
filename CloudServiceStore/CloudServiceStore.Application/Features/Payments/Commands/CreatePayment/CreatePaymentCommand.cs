using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Payments.Commands.CreatePayment;

public record CreatePaymentCommand(Guid OrderRequestId) : IRequest<string>;
