using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Payments.Commands.ConfirmPaymentWebhook;

public record ConfirmPaymentWebhookCommand(string IdempotencyKey, decimal Amount) : IRequest;
