using System.Text.Json;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

public abstract class FeatureControllerBase : ControllerBase
{
    protected readonly ICurrentUserService CurrentUser;
    protected readonly IUnitOfWork UnitOfWork;

    protected FeatureControllerBase(ICurrentUserService currentUser, IUnitOfWork unitOfWork)
    {
        CurrentUser = currentUser;
        UnitOfWork = unitOfWork;
    }

    protected Guid UserId => CurrentUser.UserId ?? throw new UnauthorizedException("Người dùng chưa đăng nhập.");
}

[ApiController]
[Route("api/billing-addresses")]
[Authorize]
public class BillingAddressesController : FeatureControllerBase
{
    private readonly IRepository<BillingAddress> _repo;
    public BillingAddressesController(IRepository<BillingAddress> repo, ICurrentUserService user, IUnitOfWork uow) : base(user, uow) => _repo = repo;

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct) => Ok((await _repo.WhereAsync(x => x.UserId == UserId, ct)).OrderByDescending(x => x.IsDefault).ThenByDescending(x => x.CreatedAt));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BillingAddressRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.PhoneNumber) || string.IsNullOrWhiteSpace(request.AddressLine) || string.IsNullOrWhiteSpace(request.City))
            return BadRequest(new { message = "Họ tên, số điện thoại, địa chỉ và tỉnh/thành là bắt buộc." });
        var existing = await _repo.WhereAsync(x => x.UserId == UserId, ct);
        if (request.IsDefault || existing.Count == 0)
            foreach (var item in existing.Where(x => x.IsDefault)) { item.IsDefault = false; _repo.Update(item); }
        var address = new BillingAddress { Id = Guid.NewGuid(), UserId = UserId, FullName = request.FullName.Trim(), PhoneNumber = request.PhoneNumber.Trim(), Company = request.Company, TaxCode = request.TaxCode, AddressLine = request.AddressLine.Trim(), City = request.City.Trim(), PostalCode = request.PostalCode, IsDefault = request.IsDefault || existing.Count == 0 };
        await _repo.AddAsync(address, ct); await UnitOfWork.SaveChangesAsync(ct);
        return Created($"api/billing-addresses/{address.Id}", address);
    }

    [HttpPut("{id:guid}/default")]
    public async Task<IActionResult> SetDefault(Guid id, CancellationToken ct)
    {
        var addresses = await _repo.WhereAsync(x => x.UserId == UserId, ct);
        var selected = addresses.FirstOrDefault(x => x.Id == id);
        if (selected is null) return NotFound();
        foreach (var item in addresses) { item.IsDefault = item.Id == id; _repo.Update(item); }
        await UnitOfWork.SaveChangesAsync(ct); return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var item = await _repo.GetByIdAsync(id, ct);
        if (item is null || item.UserId != UserId) return NotFound();
        var wasDefault = item.IsDefault; _repo.Delete(item); await UnitOfWork.SaveChangesAsync(ct);
        if (wasDefault) { var next = (await _repo.WhereAsync(x => x.UserId == UserId, ct)).FirstOrDefault(); if (next != null) { next.IsDefault = true; _repo.Update(next); await UnitOfWork.SaveChangesAsync(ct); } }
        return NoContent();
    }
}

public record BillingAddressRequest(string FullName, string PhoneNumber, string? Company, string? TaxCode, string AddressLine, string City, string? PostalCode, bool IsDefault);

[ApiController]
[Route("api/vip-club")]
[Authorize]
public class VipClubController : FeatureControllerBase
{
    private readonly IRepository<OrderRequest> _orders;
    public VipClubController(IRepository<OrderRequest> orders, ICurrentUserService user, IUnitOfWork uow) : base(user, uow) => _orders = orders;
    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var total = (await _orders.WhereAsync(x => x.UserId == UserId && x.Status == OrderStatus.Paid, ct)).Sum(x => x.TotalAmount);
        var (tier, discount, next, target) = total switch { < 1_000_000m => ("Đồng", 0, "Bạc", 1_000_000m), < 5_000_000m => ("Bạc", 3, "Vàng", 5_000_000m), < 20_000_000m => ("Vàng", 5, "Kim Cương", 20_000_000m), _ => ("Kim Cương", 10, (string?)null, total) };
        return Ok(new { currentTier = tier, discountPercent = discount, totalSpent = total, nextTierName = next, amountToNextTier = Math.Max(0, target - total) });
    }
}

[ApiController]
[Route("api/pinned-services")]
[Authorize]
public class PinnedServicesController : FeatureControllerBase
{
    private readonly IRepository<PinnedService> _repo;
    public PinnedServicesController(IRepository<PinnedService> repo, ICurrentUserService user, IUnitOfWork uow) : base(user, uow) => _repo = repo;
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct) => Ok((await _repo.WhereAsync(x => x.UserId == UserId, ct)).OrderByDescending(x => x.PinnedAt));
    [HttpPost("toggle")]
    public async Task<IActionResult> Toggle([FromBody] TogglePinRequest request, CancellationToken ct)
    {
        var type = request.ServiceType.Trim().ToUpperInvariant();
        if (type is not ("VPS" or "DOMAIN" or "SSL")) return BadRequest(new { message = "ServiceType phải là VPS, DOMAIN hoặc SSL." });
        var existing = await _repo.FirstOrDefaultAsync(x => x.UserId == UserId && x.ServiceType == type && x.ServiceId == request.ServiceId, ct);
        if (existing != null) { _repo.Delete(existing); await UnitOfWork.SaveChangesAsync(ct); return Ok(new { pinned = false }); }
        var pin = new PinnedService { Id = Guid.NewGuid(), UserId = UserId, ServiceType = type, ServiceId = request.ServiceId, DisplayName = request.DisplayName.Trim() };
        await _repo.AddAsync(pin, ct); await UnitOfWork.SaveChangesAsync(ct); return Ok(new { pinned = true, item = pin });
    }
}
public record TogglePinRequest(string ServiceType, Guid ServiceId, string DisplayName);

[ApiController]
[Route("api/tickets")]
[Authorize]
public class TicketFeedbackController : FeatureControllerBase
{
    private readonly IRepository<TicketFeedback> _feedback;
    private readonly IRepository<SupportTicket> _tickets;
    public TicketFeedbackController(IRepository<TicketFeedback> feedback, IRepository<SupportTicket> tickets, ICurrentUserService user, IUnitOfWork uow) : base(user, uow) { _feedback = feedback; _tickets = tickets; }
    [HttpGet("{id:guid}/feedback")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct) { var ticket = await _tickets.GetByIdAsync(id, ct); if (ticket is null || (ticket.UserId != UserId && !CurrentUser.IsInRole("Admin") && !CurrentUser.IsInRole("Staff"))) return NotFound(); return Ok(await _feedback.FirstOrDefaultAsync(x => x.TicketId == id, ct)); }
    [HttpPost("{id:guid}/feedback")]
    public async Task<IActionResult> Submit(Guid id, [FromBody] TicketFeedbackRequest request, CancellationToken ct)
    {
        var ticket = await _tickets.GetByIdAsync(id, ct);
        if (ticket is null || ticket.UserId != UserId) return NotFound();
        if (ticket.Status != TicketStatus.Closed) return BadRequest(new { message = "Chỉ ticket đã đóng mới được đánh giá." });
        if (request.Rating is < 1 or > 5) return BadRequest(new { message = "Điểm đánh giá phải từ 1 đến 5." });
        if (await _feedback.AnyAsync(x => x.TicketId == id, ct)) return Conflict(new { message = "Ticket này đã được đánh giá." });
        var item = new TicketFeedback { Id = Guid.NewGuid(), TicketId = id, UserId = UserId, Rating = request.Rating, Comment = request.Comment?.Trim(), TagsJson = JsonSerializer.Serialize(request.Tags ?? Array.Empty<string>()) };
        await _feedback.AddAsync(item, ct); await UnitOfWork.SaveChangesAsync(ct); return Ok(item);
    }
}
public record TicketFeedbackRequest(int Rating, string? Comment, string[]? Tags);

[ApiController]
[Route("api/service-bundles")]
public class ServiceBundlesController : FeatureControllerBase
{
    private readonly IRepository<ServiceBundle> _bundles; private readonly IRepository<Cart> _carts; private readonly IRepository<ServicePlan> _plans;
    public ServiceBundlesController(IRepository<ServiceBundle> bundles, IRepository<Cart> carts, IRepository<ServicePlan> plans, ICurrentUserService user, IUnitOfWork uow) : base(user, uow) { _bundles = bundles; _carts = carts; _plans = plans; }
    [HttpGet, AllowAnonymous]
    public async Task<IActionResult> Get(CancellationToken ct) => Ok((await _bundles.WhereAsync(x => x.IsActive, ct)).OrderByDescending(x => x.DiscountPercent));
    [HttpPost, Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> Create([FromBody] ServiceBundleRequest request, CancellationToken ct) { if (request.DiscountPercent is < 0 or > 100 || request.PlanIds.Length == 0) return BadRequest(); var item = new ServiceBundle { Id = Guid.NewGuid(), Name = request.Name.Trim(), Description = request.Description.Trim(), ImageUrl = request.ImageUrl, DiscountPercent = request.DiscountPercent, IncludedPlanIdsJson = JsonSerializer.Serialize(request.PlanIds) }; await _bundles.AddAsync(item, ct); await UnitOfWork.SaveChangesAsync(ct); return Ok(item); }
    [HttpPost("{id:guid}/add-to-cart"), Authorize]
    public async Task<IActionResult> AddToCart(Guid id, CancellationToken ct)
    {
        var bundle = await _bundles.GetByIdAsync(id, ct); if (bundle is null || !bundle.IsActive) return NotFound();
        var ids = JsonSerializer.Deserialize<Guid[]>(bundle.IncludedPlanIdsJson) ?? Array.Empty<Guid>();
        var activeIds = (await _plans.GetAllAsync(ct)).Where(x => x.IsActive && ids.Contains(x.Id)).Select(x => x.Id).ToArray();
        if (activeIds.Length == 0) return BadRequest(new { message = "Combo chưa có gói khả dụng." });
        var cart = await _carts.FirstOrDefaultAsync(x => x.UserId == UserId && x.Status == CartStatus.Active, ct, x => x.Items);
        if (cart is null) { cart = new Cart(UserId); await _carts.AddAsync(cart, ct); }
        foreach (var planId in activeIds) cart.AddItem(planId, BillingCycle.Monthly, 1);
        cart.ApplyBundleDiscount(bundle.DiscountPercent);
        await UnitOfWork.SaveChangesAsync(ct); return Ok(new { added = activeIds.Length, discountPercent = bundle.DiscountPercent });
    }
}
public record ServiceBundleRequest(string Name, string Description, string? ImageUrl, decimal DiscountPercent, Guid[] PlanIds);

[ApiController]
[Route("api/stock-alerts")]
[Authorize]
public class StockAlertsController : FeatureControllerBase
{
    private readonly IRepository<StockAlertSubscription> _repo; private readonly IRepository<ServicePlan> _plans;
    public StockAlertsController(IRepository<StockAlertSubscription> repo, IRepository<ServicePlan> plans, ICurrentUserService user, IUnitOfWork uow) : base(user, uow) { _repo = repo; _plans = plans; }
    [HttpGet("me")]
    public async Task<IActionResult> Get(CancellationToken ct) => Ok(await _repo.WhereAsync(x => x.UserId == UserId, ct));
    [HttpPost]
    public async Task<IActionResult> Subscribe([FromBody] StockAlertRequest request, CancellationToken ct) { if (!await _plans.AnyAsync(x => x.Id == request.ServicePlanId, ct)) return NotFound(); var existing = await _repo.FirstOrDefaultAsync(x => x.UserId == UserId && x.ServicePlanId == request.ServicePlanId, ct); if (existing != null) { existing.TargetPrice = request.TargetPrice; existing.NotifyWhenAvailable = request.NotifyWhenAvailable; existing.IsNotified = false; _repo.Update(existing); await UnitOfWork.SaveChangesAsync(ct); return Ok(existing); } var item = new StockAlertSubscription { Id = Guid.NewGuid(), UserId = UserId, ServicePlanId = request.ServicePlanId, TargetPrice = request.TargetPrice, NotifyWhenAvailable = request.NotifyWhenAvailable }; await _repo.AddAsync(item, ct); await UnitOfWork.SaveChangesAsync(ct); return Ok(item); }
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct) { var item = await _repo.GetByIdAsync(id, ct); if (item is null || item.UserId != UserId) return NotFound(); _repo.Delete(item); await UnitOfWork.SaveChangesAsync(ct); return NoContent(); }
}
public record StockAlertRequest(Guid ServicePlanId, decimal? TargetPrice, bool NotifyWhenAvailable);

[ApiController]
[Route("api/free-trials")]
[Authorize]
public class FreeTrialsController : FeatureControllerBase
{
    private readonly IRepository<FreeTrialRequest> _repo; private readonly IRepository<ServicePlan> _plans;
    public FreeTrialsController(IRepository<FreeTrialRequest> repo, IRepository<ServicePlan> plans, ICurrentUserService user, IUnitOfWork uow) : base(user, uow) { _repo = repo; _plans = plans; }
    [HttpGet("my-status")]
    public async Task<IActionResult> Status(CancellationToken ct) { var item = await _repo.FirstOrDefaultAsync(x => x.UserId == UserId, ct); if (item != null && item.Status == "Active" && item.ExpiresAt <= DateTime.UtcNow) { item.Status = "Expired"; _repo.Update(item); await UnitOfWork.SaveChangesAsync(ct); } return item is null ? Ok(new { status = "Available" }) : Ok(item); }
    [HttpPost("request")]
    public async Task<IActionResult> StartTrial([FromBody] FreeTrialRequestDto request, CancellationToken ct) { if (await _repo.AnyAsync(x => x.UserId == UserId, ct)) return Conflict(new { message = "Mỗi tài khoản chỉ được dùng thử một lần." }); if (!await _plans.AnyAsync(x => x.Id == request.ServicePlanId && x.IsActive, ct)) return NotFound(); var now = DateTime.UtcNow; var item = new FreeTrialRequest { Id = Guid.NewGuid(), UserId = UserId, ServicePlanId = request.ServicePlanId, StartsAt = now, ExpiresAt = now.AddDays(3), Status = "Active" }; await _repo.AddAsync(item, ct); await UnitOfWork.SaveChangesAsync(ct); return Ok(item); }
}
public record FreeTrialRequestDto(Guid ServicePlanId);

[ApiController]
[Route("api/service-plans")]
public class ServicePlanCommunityController : FeatureControllerBase
{
    private readonly IRepository<PlanPriceHistory> _history; private readonly IRepository<PlanQuestion> _questions; private readonly IRepository<PlanAnswer> _answers; private readonly IRepository<ServicePlan> _plans;
    public ServicePlanCommunityController(IRepository<PlanPriceHistory> history, IRepository<PlanQuestion> questions, IRepository<PlanAnswer> answers, IRepository<ServicePlan> plans, ICurrentUserService user, IUnitOfWork uow) : base(user, uow) { _history = history; _questions = questions; _answers = answers; _plans = plans; }
    [HttpGet("{id:guid}/price-history"), AllowAnonymous]
    public async Task<IActionResult> History(Guid id, CancellationToken ct) => Ok((await _history.WhereAsync(x => x.ServicePlanId == id, ct)).OrderBy(x => x.ChangedAt).TakeLast(24));
    [HttpPost("{id:guid}/price-history"), Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> AddHistory(Guid id, [FromBody] PriceHistoryRequest request, CancellationToken ct) { if (!await _plans.AnyAsync(x => x.Id == id, ct)) return NotFound(); var item = new PlanPriceHistory { Id = Guid.NewGuid(), ServicePlanId = id, OldPrice = request.OldPrice, NewPrice = request.NewPrice, Currency = request.Currency, Reason = request.Reason }; await _history.AddAsync(item, ct); await UnitOfWork.SaveChangesAsync(ct); return Ok(item); }
    [HttpGet("{id:guid}/questions"), AllowAnonymous]
    public async Task<IActionResult> Questions(Guid id, CancellationToken ct) { var qs = (await _questions.WhereAsync(x => x.ServicePlanId == id && x.IsApproved, ct)).OrderByDescending(x => x.CreatedAt).ToList(); var answerList = await _answers.GetAllAsync(ct); return Ok(qs.Select(q => new { q.Id, q.ServicePlanId, q.UserId, q.Content, q.CreatedAt, answers = answerList.Where(a => a.QuestionId == q.Id).OrderBy(a => a.CreatedAt) })); }
    [HttpPost("{id:guid}/questions"), Authorize]
    public async Task<IActionResult> Ask(Guid id, [FromBody] QuestionRequest request, CancellationToken ct) { if (string.IsNullOrWhiteSpace(request.Content) || request.Content.Length > 1000) return BadRequest(); if (!await _plans.AnyAsync(x => x.Id == id, ct)) return NotFound(); var item = new PlanQuestion { Id = Guid.NewGuid(), ServicePlanId = id, UserId = UserId, Content = request.Content.Trim() }; await _questions.AddAsync(item, ct); await UnitOfWork.SaveChangesAsync(ct); return Ok(item); }
}

[ApiController]
[Route("api/plan-questions")]
[Authorize(Roles = "Admin,Staff,Editor")]
public class PlanAnswersController : FeatureControllerBase
{
    private readonly IRepository<PlanQuestion> _questions; private readonly IRepository<PlanAnswer> _answers;
    public PlanAnswersController(IRepository<PlanQuestion> questions, IRepository<PlanAnswer> answers, ICurrentUserService user, IUnitOfWork uow) : base(user, uow) { _questions = questions; _answers = answers; }
    [HttpPost("{questionId:guid}/answers")]
    public async Task<IActionResult> Answer(Guid questionId, [FromBody] QuestionRequest request, CancellationToken ct) { if (string.IsNullOrWhiteSpace(request.Content) || !await _questions.AnyAsync(x => x.Id == questionId, ct)) return BadRequest(); var item = new PlanAnswer { Id = Guid.NewGuid(), QuestionId = questionId, UserId = UserId, Content = request.Content.Trim(), IsStaffAnswer = true }; await _answers.AddAsync(item, ct); await UnitOfWork.SaveChangesAsync(ct); return Ok(item); }
}
public record PriceHistoryRequest(decimal OldPrice, decimal NewPrice, string Currency, string? Reason);
public record QuestionRequest(string Content);
