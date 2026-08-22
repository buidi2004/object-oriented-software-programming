using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Migrations.Commands.CreateMigration;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Migrations;

public class CreateMigrationCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IRepository<MigrationRequest>> _migrationRepoMock = new();
    private readonly Mock<IRepository<OrderRequest>> _orderRepoMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();

    private CreateMigrationCommandHandler CreateHandler() => new(_uowMock.Object, _migrationRepoMock.Object, _orderRepoMock.Object, _currentUserMock.Object);

    [Fact]
    public async Task Handle_OrderNotFound_ThrowsNotFoundException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((OrderRequest?)null);
        await Assert.ThrowsAsync<NotFoundException>(() => CreateHandler().Handle(new CreateMigrationCommand(Guid.NewGuid(), "AWS", "Help"), CancellationToken.None));
    }
    
    [Fact]
    public async Task Handle_OrderNotOwned_ThrowsUnauthorizedException()
    {
        _currentUserMock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(new OrderRequest { UserId = Guid.NewGuid() });
        await Assert.ThrowsAsync<UnauthorizedException>(() => CreateHandler().Handle(new CreateMigrationCommand(Guid.NewGuid(), "AWS", "Help"), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ValidRequest_CreatesMigration()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(c => c.UserId).Returns(userId);
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(new OrderRequest { UserId = userId });
        
        var result = await CreateHandler().Handle(new CreateMigrationCommand(Guid.NewGuid(), "AWS", "Help"), CancellationToken.None);
        
        Assert.NotEqual(Guid.Empty, result);
        _migrationRepoMock.Verify(r => r.AddAsync(It.IsAny<MigrationRequest>(), It.IsAny<CancellationToken>()), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
