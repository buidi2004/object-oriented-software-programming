using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Invoices.Commands.GenerateInvoice;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Invoices;

public class GenerateInvoiceCommandHandlerTests
{
    private readonly Mock<IRepository<Invoice>> _invoiceRepoMock = new();
    private readonly Mock<IRepository<OrderRequest>> _orderRepoMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    
    private GenerateInvoiceCommandHandler CreateHandler() 
        => new(_invoiceRepoMock.Object, _orderRepoMock.Object, _unitOfWorkMock.Object);

    [Fact]
    public async Task Handle_OrderNotFound_ThrowsNotFoundException()
    {
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrderRequest?)null);

        var command = new GenerateInvoiceCommand { OrderRequestId = Guid.NewGuid() };
        var handler = CreateHandler();

        await Assert.ThrowsAsync<NotFoundException>(() => handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_OrderNotPaid_ThrowsConflictException()
    {
        var order = new OrderRequest { Id = Guid.NewGuid(), Status = OrderStatus.Pending };
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);

        var command = new GenerateInvoiceCommand { OrderRequestId = order.Id };
        var handler = CreateHandler();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => handler.Handle(command, CancellationToken.None));
        Assert.Contains("only be generated for Paid orders", exception.Message);
    }

    [Fact]
    public async Task Handle_InvoiceAlreadyExists_ThrowsConflictException()
    {
        var order = new OrderRequest { Id = Guid.NewGuid(), Status = OrderStatus.Paid };
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);
            
        var existingInvoice = new Invoice { Id = Guid.NewGuid() };
        _invoiceRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Invoice, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingInvoice);

        var command = new GenerateInvoiceCommand { OrderRequestId = order.Id };
        var handler = CreateHandler();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => handler.Handle(command, CancellationToken.None));
        Assert.Contains("already exists", exception.Message);
    }

    [Fact]
    public async Task Handle_ValidRequest_CreatesInvoiceAndReturnsId()
    {
        var order = new OrderRequest { Id = Guid.NewGuid(), Status = OrderStatus.Paid };
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);
            
        _invoiceRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Invoice, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Invoice?)null);

        var command = new GenerateInvoiceCommand { OrderRequestId = order.Id };
        var handler = CreateHandler();

        var result = await handler.Handle(command, CancellationToken.None);

        _invoiceRepoMock.Verify(r => r.AddAsync(It.IsAny<Invoice>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        Assert.NotEqual(Guid.Empty, result);
    }
}
