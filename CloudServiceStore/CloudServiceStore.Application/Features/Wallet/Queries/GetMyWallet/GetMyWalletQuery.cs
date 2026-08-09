using System;
using CloudServiceStore.Domain.Entities;
using MediatR;

namespace CloudServiceStore.Application.Features.Wallet.Queries.GetMyWallet;

public record GetMyWalletQuery : IRequest<Domain.Entities.Wallet>;
