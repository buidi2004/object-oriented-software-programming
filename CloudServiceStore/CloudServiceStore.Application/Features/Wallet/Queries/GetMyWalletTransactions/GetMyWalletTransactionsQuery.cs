using System;
using System.Collections.Generic;
using CloudServiceStore.Domain.Entities;
using MediatR;

namespace CloudServiceStore.Application.Features.Wallet.Queries.GetMyWalletTransactions;

public record GetMyWalletTransactionsQuery : IRequest<IEnumerable<WalletTransaction>>;
