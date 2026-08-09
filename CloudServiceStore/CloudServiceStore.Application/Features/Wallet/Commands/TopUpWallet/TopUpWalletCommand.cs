using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Wallet.Commands.TopUpWallet;

public record TopUpWalletCommand(decimal Amount) : IRequest<bool>;
