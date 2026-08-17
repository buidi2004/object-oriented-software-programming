using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.GiftCards.Commands.RedeemGiftCard;
using CloudServiceStore.Application.Features.GiftCards.Queries.GetGiftCardBalance;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/gift-cards")]
public class GiftCardsController : ControllerBase
{
    private readonly IMediator _mediator;
    public GiftCardsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll([FromServices] CloudServiceStore.Domain.Interfaces.IRepository<CloudServiceStore.Domain.Entities.GiftCard> repo, CancellationToken ct)
    {
        var list = await repo.GetAllAsync();
        return Ok(list);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(
        [FromBody] CreateGiftCardDto dto,
        [FromServices] CloudServiceStore.Domain.Interfaces.IRepository<CloudServiceStore.Domain.Entities.GiftCard> repo,
        [FromServices] CloudServiceStore.Domain.Interfaces.IUnitOfWork uow,
        CancellationToken ct)
    {
        var card = new CloudServiceStore.Domain.Entities.GiftCard
        {
            Code = string.IsNullOrWhiteSpace(dto.Code) ? $"GC-{Guid.NewGuid().ToString("N")[..8].ToUpper()}" : dto.Code.Trim().ToUpper(),
            Amount = dto.Amount,
            RemainingAmount = dto.Amount,
            ExpiryDate = dto.ExpiryDate ?? DateTime.UtcNow.AddMonths(6),
            IsActive = true
        };
        await repo.AddAsync(card, ct);
        await uow.SaveChangesAsync(ct);
        return Ok(card);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(
        Guid id,
        [FromServices] CloudServiceStore.Domain.Interfaces.IRepository<CloudServiceStore.Domain.Entities.GiftCard> repo,
        [FromServices] CloudServiceStore.Domain.Interfaces.IUnitOfWork uow,
        CancellationToken ct)
    {
        var card = await repo.GetByIdAsync(id);
        if (card != null)
        {
            card.IsActive = false;
            repo.Update(card);
            await uow.SaveChangesAsync(ct);
        }
        return NoContent();
    }

    [HttpGet("{code}/balance")]
    public async Task<IActionResult> GetBalance(string code, CancellationToken ct)
    {
        var balance = await _mediator.Send(new GetGiftCardBalanceQuery { Code = code }, ct);
        return Ok(balance);
    }

    [HttpPost("redeem")]
    [Authorize]
    public async Task<IActionResult> Redeem([FromBody] RedeemGiftCardCommand command, CancellationToken ct)
    {
        var remaining = await _mediator.Send(command, ct);
        return Ok(new { remainingAmount = remaining });
    }
}

public class CreateGiftCardDto
{
    [System.ComponentModel.DataAnnotations.MaxLength(50)]
    [System.ComponentModel.DataAnnotations.RegularExpression(@"^[a-zA-Z0-9-]*$")]
    public string? Code { get; set; }

    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }

    public DateTime? ExpiryDate { get; set; }
}
