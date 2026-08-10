using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Invoices.Queries.GetInvoice;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Invoices;

public class GetInvoiceQueryHandlerTests
{
    private readonly Mock<IRepository<Invoice>> _invoiceRepoMock = new();
    private readonly Mock<IRepository<OrderRequest>> _orderRepoMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();
    
    private GetInvoiceQueryHandler CreateHandler() 
        => new(_invoiceRepoMock.Object, _orderRepoMock.Object, _currentUserMock.Object);

    [Fact]
    public async Task Handle_UnauthenticatedUser_ThrowsUnauthorizedException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns((Guid?)null);

        var query = new GetInvoiceQuery { OrderRequestId = Guid.NewGuid() };
        var handler = CreateHandler();

        await Assert.ThrowsAsync<UnauthorizedException>(() => handler.Handle(query, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_OrderNotFound_ThrowsNotFoundException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrderRequest?)null);

        var query = new GetInvoiceQuery { OrderRequestId = Guid.NewGuid() };
        var handler = CreateHandler();

        await Assert.ThrowsAsync<NotFoundException>(() => handler.Handle(query, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_UserDoesNotOwnOrder_ThrowsUnauthorizedException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        
        var order = new OrderRequest { Id = Guid.NewGuid(), UserId = Guid.NewGuid() }; // Different UserId
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);

        var query = new GetInvoiceQuery { OrderRequestId = order.Id };
        var handler = CreateHandler();

        await Assert.ThrowsAsync<UnauthorizedException>(() => handler.Handle(query, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_InvoiceNotFound_ThrowsNotFoundException()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        
        var order = new OrderRequest { Id = Guid.NewGuid(), UserId = userId };
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);
            
        _invoiceRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Invoice, bool>>>(), It.IsAny<CancellationToken>(), It.IsAny<Expression<Func<Invoice, object>>[]>()))
            .ReturnsAsync((Invoice?)null);

        var query = new GetInvoiceQuery { OrderRequestId = order.Id };
        var handler = CreateHandler();

        await Assert.ThrowsAsync<NotFoundException>(() => handler.Handle(query, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ValidRequest_ReturnsInvoiceDto()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        
        var order = new OrderRequest { Id = Guid.NewGuid(), UserId = userId };
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);
            
        var invoice = new Invoice 
        { 
            Id = Guid.NewGuid(), 
            OrderId = order.Id, 
            InvoiceNumber = "INV-12345",
            IssuedAt = DateTime.UtcNow,
            PdfUrl = "https://example.com/inv-12345.pdf"
        };
        
        _invoiceRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Invoice, bool>>>(), It.IsAny<CancellationToken>(), It.IsAny<Expression<Func<Invoice, object>>[]>()))
            .ReturnsAsync(invoice);

        var query = new GetInvoiceQuery { OrderRequestId = order.Id };
        var handler = CreateHandler();

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(invoice.Id, result.Id);
        Assert.Equal(invoice.InvoiceNumber, result.InvoiceNumber);
        Assert.Equal(invoice.PdfUrl, result.PdfUrl);
    }
}
