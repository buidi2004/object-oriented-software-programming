using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.PaymentMethods.Commands.DeletePaymentMethod;
using CloudServiceStore.Application.Features.PaymentMethods.Commands.SavePaymentMethod;
using CloudServiceStore.Application.Features.PaymentMethods.Queries.GetMyPaymentMethods;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.PaymentMethods;

public class PaymentMethodCommandHandlerTests
{
    private readonly Mock<IRepository<SavedPaymentMethod>> _repoMock = new();
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();

    // ---- GetMyPaymentMethods ----

    [Fact]
    public async Task GetMy_Unauthenticated_ThrowsUnauthorizedException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns((Guid?)null);
        var handler = new GetMyPaymentMethodsQueryHandler(_repoMock.Object, _currentUserMock.Object);
        await Assert.ThrowsAsync<UnauthorizedException>(() => handler.Handle(new GetMyPaymentMethodsQuery(), CancellationToken.None));
    }

    [Fact]
    public async Task GetMy_Authenticated_ReturnsOnlyOwnMethods()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);

        var methods = new List<SavedPaymentMethod>
        {
            new() { Id = Guid.NewGuid(), UserId = userId, Gateway = "VNPAY", MaskedInfo = "**** 1234", IsDefault = true, CreatedAt = DateTime.UtcNow }
        };
        _repoMock.Setup(r => r.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<SavedPaymentMethod, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(methods);

        var handler = new GetMyPaymentMethodsQueryHandler(_repoMock.Object, _currentUserMock.Object);
        var result = await handler.Handle(new GetMyPaymentMethodsQuery(), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal("VNPAY", result[0].Gateway);
    }

    // ---- SavePaymentMethod ----

    [Fact]
    public async Task Save_Unauthenticated_ThrowsUnauthorizedException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns((Guid?)null);
        var handler = new SavePaymentMethodCommandHandler(_repoMock.Object, _uowMock.Object, _currentUserMock.Object);
        await Assert.ThrowsAsync<UnauthorizedException>(() => handler.Handle(new SavePaymentMethodCommand { Gateway = "MOMO", MaskedInfo = "**** 5678" }, CancellationToken.None));
    }

    [Fact]
    public async Task Save_ValidRequest_CreatesMethod()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        _repoMock.Setup(r => r.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<SavedPaymentMethod, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<SavedPaymentMethod>());

        var handler = new SavePaymentMethodCommandHandler(_repoMock.Object, _uowMock.Object, _currentUserMock.Object);
        var result = await handler.Handle(new SavePaymentMethodCommand { Gateway = "MOMO", MaskedInfo = "**** 5678", IsDefault = false }, CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result);
        _repoMock.Verify(r => r.AddAsync(It.IsAny<SavedPaymentMethod>(), It.IsAny<CancellationToken>()), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    // ---- DeletePaymentMethod ----

    [Fact]
    public async Task Delete_NotOwner_ThrowsUnauthorizedException()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);

        var method = new SavedPaymentMethod { Id = Guid.NewGuid(), UserId = Guid.NewGuid() }; // Different owner
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(method);

        var handler = new DeletePaymentMethodCommandHandler(_repoMock.Object, _uowMock.Object, _currentUserMock.Object);
        await Assert.ThrowsAsync<UnauthorizedException>(() => handler.Handle(new DeletePaymentMethodCommand { PaymentMethodId = method.Id }, CancellationToken.None));
    }

    [Fact]
    public async Task Delete_NotFound_ThrowsNotFoundException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((SavedPaymentMethod?)null);

        var handler = new DeletePaymentMethodCommandHandler(_repoMock.Object, _uowMock.Object, _currentUserMock.Object);
        await Assert.ThrowsAsync<NotFoundException>(() => handler.Handle(new DeletePaymentMethodCommand { PaymentMethodId = Guid.NewGuid() }, CancellationToken.None));
    }

    [Fact]
    public async Task Delete_ValidRequest_DeletesMethod()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        var method = new SavedPaymentMethod { Id = Guid.NewGuid(), UserId = userId };
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(method);

        var handler = new DeletePaymentMethodCommandHandler(_repoMock.Object, _uowMock.Object, _currentUserMock.Object);
        var result = await handler.Handle(new DeletePaymentMethodCommand { PaymentMethodId = method.Id }, CancellationToken.None);

        Assert.True(result);
        _repoMock.Verify(r => r.Delete(It.IsAny<SavedPaymentMethod>()), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
