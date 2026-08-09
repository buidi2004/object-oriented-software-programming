using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Wallet.Commands.PayWithWallet;

public record PayWithWalletCommand(Guid OrderId) : IRequest<bool>;
