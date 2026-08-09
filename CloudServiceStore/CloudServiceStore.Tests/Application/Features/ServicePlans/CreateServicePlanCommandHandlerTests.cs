using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.ServicePlans.Commands.Create;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.ServicePlans;

public class CreateServicePlanCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IRepository<ServicePlan>> _planRepoMock = new();
    private readonly Mock<IRepository<ServiceCategory>> _categoryRepoMock = new();
    private readonly Mock<IQrCodeGeneratorFactory> _qrFactoryMock = new();
    private readonly Mock<IQrCodeGenerator> _qrGeneratorMock = new();

    public CreateServicePlanCommandHandlerTests()
    {
        _qrFactoryMock.Setup(f => f.CreateGenerator(It.IsAny<QrCodeType>()))
            .Returns(_qrGeneratorMock.Object);
        _qrGeneratorMock.Setup(g => g.GenerateUrl(It.IsAny<string>()))
            .Returns("http://fake-qr-url.com");
    }

    private CreateServicePlanCommandHandler CreateHandler() =>
        new(_uowMock.Object, _planRepoMock.Object, _categoryRepoMock.Object, _qrFactoryMock.Object);

    [Fact]
    public async Task Handle_CategoryNotFound_ThrowsNotFoundException()
    {
        _categoryRepoMock.Setup(r => r.AnyAsync(It.IsAny<Expression<Func<ServiceCategory, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var command = new CreateServicePlanCommand(Guid.NewGuid(), "Plan", null, null, null, null, true);

        await Assert.ThrowsAsync<NotFoundException>(
            () => CreateHandler().Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ValidRequest_CreatesPlanWithQrCode()
    {
        _categoryRepoMock.Setup(r => r.AnyAsync(It.IsAny<Expression<Func<ServiceCategory, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var command = new CreateServicePlanCommand(Guid.NewGuid(), "Valid Plan", "2 Core", "4GB", "50GB", "Unmetered", true);

        ServicePlan? capturedPlan = null;
        _planRepoMock.Setup(r => r.AddAsync(It.IsAny<ServicePlan>(), It.IsAny<CancellationToken>()))
            .Callback<ServicePlan, CancellationToken>((plan, _) => capturedPlan = plan)
            .Returns(Task.CompletedTask);

        var result = await CreateHandler().Handle(command, CancellationToken.None);

        result.Should().NotBeEmpty();
        capturedPlan.Should().NotBeNull();
        capturedPlan!.Name.Should().Be("Valid Plan");
        capturedPlan.QrCodeUrl.Should().Be("http://fake-qr-url.com");
        
        _qrFactoryMock.Verify(f => f.CreateGenerator(QrCodeType.ServicePlan), Times.Once);
        _qrGeneratorMock.Verify(g => g.GenerateUrl(It.IsAny<string>()), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
