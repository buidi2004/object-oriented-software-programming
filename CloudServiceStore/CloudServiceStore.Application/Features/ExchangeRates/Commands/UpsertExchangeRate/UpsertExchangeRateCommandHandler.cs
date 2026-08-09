using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.ExchangeRates.Commands.UpsertExchangeRate;

public class UpsertExchangeRateCommandHandler : IRequestHandler<UpsertExchangeRateCommand, bool>
{
    private readonly IRepository<ExchangeRate> _rateRepo;
    private readonly IUnitOfWork _unitOfWork;

    public UpsertExchangeRateCommandHandler(IRepository<ExchangeRate> rateRepo, IUnitOfWork unitOfWork)
    {
        _rateRepo = rateRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(UpsertExchangeRateCommand request, CancellationToken cancellationToken)
    {
        var from = request.FromCurrency.ToUpperInvariant();
        var to = request.ToCurrency.ToUpperInvariant();

        var existing = await _rateRepo.FirstOrDefaultAsync(
            r => r.FromCurrency == from && r.ToCurrency == to,
            cancellationToken);

        if (existing == null)
        {
            var rate = new ExchangeRate
            {
                Id = Guid.NewGuid(),
                FromCurrency = from,
                ToCurrency = to,
                Rate = request.Rate,
                UpdatedAt = DateTime.UtcNow
            };
            await _rateRepo.AddAsync(rate, cancellationToken);
        }
        else
        {
            existing.Rate = request.Rate;
            existing.UpdatedAt = DateTime.UtcNow;
            _rateRepo.Update(existing);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
