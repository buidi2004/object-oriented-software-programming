using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Backups.Commands.ScheduleBackup;
using CloudServiceStore.Application.Features.Backups.Queries.GetBackupsForOrder;
using CloudServiceStore.Application.Features.Uptime.Queries.GetOrderUptime;
using CloudServiceStore.Application.Features.Orders.Commands.Checkout;
using CloudServiceStore.Application.Features.Orders.Queries.GetMyOrders;
using CloudServiceStore.Application.Features.Orders.Queries.GetOrderById;
using CloudServiceStore.Application.Features.Orders.Queries.GetOrders;
using CloudServiceStore.Application.Features.Invoices.Queries.GetInvoice;
using CloudServiceStore.Application.Features.Invoices.Queries.GetMyInvoices;
using CloudServiceStore.Application.Features.Invoices.Queries.GetAllInvoices;
using CloudServiceStore.Application.Features.Invoices.Commands.GenerateInvoice;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IRepository<OrderRequest> _orderRepo;
    private readonly IUnitOfWork _uow;

    public OrdersController(
        IMediator mediator,
        IRepository<OrderRequest> orderRepo,
        IUnitOfWork uow)
    {
        _mediator = mediator;
        _orderRepo = orderRepo;
        _uow = uow;
    }

    [HttpPost("checkout")]
    [Authorize]
    public async Task<IActionResult> Checkout([FromBody] CheckoutCommand command, CancellationToken ct)
    {
        var orderId = await _mediator.Send(command, ct);
        return Ok(new { orderId });
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetOrders([FromQuery] string? status, CancellationToken ct)
    {
        var isAdminOrStaff = User.IsInRole("Admin") || User.IsInRole("Accountant") || User.IsInRole("Technician") 
            || User.IsInRole("Editor") || User.IsInRole("Support") || User.IsInRole("Staff");

        if (isAdminOrStaff)
        {
            var orders = await _mediator.Send(new GetOrdersQuery(status), ct);
            return Ok(orders);
        }

        var myOrders = await _mediator.Send(new GetMyOrdersQuery(status), ct);
        return Ok(myOrders);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMyOrders([FromQuery] string? status, CancellationToken ct)
    {
        var orders = await _mediator.Send(new GetMyOrdersQuery(status), ct);
        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var order = await _mediator.Send(new GetOrderByIdQuery(id), ct);
        return Ok(order);
    }

    // --- BACKUPS ---

    [HttpGet("{id:guid}/backups")]
    [Authorize]
    public async Task<IActionResult> GetBackups(Guid id, CancellationToken ct)
    {
        var backups = await _mediator.Send(new GetBackupsForOrderQuery(id), ct);
        return Ok(backups);
    }

    [HttpPost("{id:guid}/backups/schedule")]
    [Authorize]
    public async Task<IActionResult> ScheduleBackup(Guid id, [FromBody] ScheduleBackupCommand command, CancellationToken ct)
    {
        if (id != command.OrderId) return BadRequest("Mismatched Order Id");
        var backupId = await _mediator.Send(command, ct);
        return Ok(new { backupId });
    }

    // --- UPTIME ---

    [HttpGet("{id:guid}/uptime")]
    [Authorize]
    public async Task<IActionResult> GetOrderUptime(Guid id, CancellationToken ct)
    {
        var uptime = await _mediator.Send(new GetOrderUptimeQuery(id), ct);
        return Ok(uptime);
    }

    [HttpPatch("{id:guid}/auto-renew")]
    [Authorize]
    public async Task<IActionResult> ToggleAutoRenew(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new CloudServiceStore.Application.Features.AutoRenew.Commands.ToggleAutoRenew.ToggleAutoRenewCommand(id), ct);
        return Ok(new { success = result });
    }

    // --- CONTROL PANEL ---

    [HttpPost("{id:guid}/control-panel/access-token")]
    public async Task<IActionResult> GetControlPanelAccessToken(Guid id, CancellationToken ct)
    {
        var token = await _mediator.Send(new CloudServiceStore.Application.Features.Orders.Commands.GetControlPanelAccessToken.GetControlPanelAccessTokenCommand(id), ct);
        return Ok(new { token });
    }

    // --- INVOICES ---

    [HttpGet("{id:guid}/invoice")]
    [Authorize]
    public async Task<IActionResult> GetInvoice(Guid id, CancellationToken ct)
    {
        var invoice = await _mediator.Send(new GetInvoiceQuery { OrderRequestId = id }, ct);
        return Ok(invoice);
    }
    
    [HttpPost("{id:guid}/invoice")]
    [Authorize]
    public async Task<IActionResult> GenerateInvoice(Guid id, CancellationToken ct)
    {
        var invoiceId = await _mediator.Send(new GenerateInvoiceCommand { OrderRequestId = id }, ct);
        return Ok(new { invoiceId });
    }

    [HttpGet("me/invoices")]
    [Authorize]
    public async Task<IActionResult> GetMyInvoices(CancellationToken ct)
    {
        var invoices = await _mediator.Send(new GetMyInvoicesQuery(), ct);
        return Ok(invoices);
    }

    [HttpGet("invoices/admin")]
    [Authorize(Roles = "Admin,Accountant,Technician,Editor,Support,Staff")]
    public async Task<IActionResult> GetAllInvoicesForAdmin(CancellationToken ct)
    {
        var invoices = await _mediator.Send(new GetAllInvoicesQuery(), ct);
        return Ok(invoices);
    }

    [HttpPut("{id:guid}/status")]
    [Authorize(Roles = "Admin,Accountant,Staff")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusRequest request, CancellationToken ct)
    {
        var order = await _orderRepo.GetByIdAsync(id, ct);
        if (order == null) return NotFound();

        if (Enum.TryParse<OrderStatus>(request.Status, true, out var newStatus))
        {
            order.Status = newStatus;
            _orderRepo.Update(order);
            await _uow.SaveChangesAsync(ct);
            return Ok(new { success = true, status = order.Status.ToString() });
        }

        return BadRequest(new { message = "Trạng thái đơn hàng không hợp lệ." });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteOrder(Guid id, CancellationToken ct)
    {
        var order = await _orderRepo.GetByIdAsync(id, ct);
        if (order == null) return NotFound();

        _orderRepo.Delete(order);
        await _uow.SaveChangesAsync(ct);
        return Ok(new { success = true });
    }
}

public record UpdateOrderStatusRequest(string Status);
