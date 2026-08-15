using System;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Configuration;
using CloudServiceStore.Application.Features.VpsInstances.Commands.ProvisionVps;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Application.Models;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.VpsInstances.Commands.ProvisionVps;

public class ProvisionVpsCommandHandlerTests
{
    private readonly Mock<IVpsProvisioningService> _mockVpsProvisioningService;
    private readonly Mock<IRepository<VpsInstance>> _mockRepositoryVpsInstance;
    private readonly Mock<IRepository<OrderRequest>> _mockOrderRepository;
    private readonly Mock<IRepository<ServiceCategory>> _mockCategoryRepository;
    private readonly Mock<IRepository<ServicePlan>> _mockPlanRepository;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IJobScheduler> _mockJobScheduler;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly ProvisionVpsCommandHandler _handler;

    public ProvisionVpsCommandHandlerTests()
    {
        _mockVpsProvisioningService = new Mock<IVpsProvisioningService>();
        _mockRepositoryVpsInstance = new Mock<IRepository<VpsInstance>>();
        _mockOrderRepository = new Mock<IRepository<OrderRequest>>();
        _mockCategoryRepository = new Mock<IRepository<ServiceCategory>>();
        _mockPlanRepository = new Mock<IRepository<ServicePlan>>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockJobScheduler = new Mock<IJobScheduler>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();

        _handler = new ProvisionVpsCommandHandler(
            _mockVpsProvisioningService.Object,
            new VpsSpecParser(),
            _mockRepositoryVpsInstance.Object,
            _mockOrderRepository.Object,
            _mockCategoryRepository.Object,
            _mockPlanRepository.Object,
            _mockUnitOfWork.Object,
            _mockJobScheduler.Object,
            _mockCurrentUserService.Object,
            Options.Create(new VpsSettings { DemoTtlMinutes = 2 }));
    }

    [Fact]
    public async Task Handle_ShouldProvisionVps_WhenOrderIsPaidCloudVps()
    {
        var userId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();
        var plan = new ServicePlan(categoryId, "Nano VPS", "2 Core", "4GB", "40GB NVMe", "Unlimited", null);
        plan.GetType().GetProperty("Id")!.SetValue(plan, Guid.NewGuid());
        var items = new System.Collections.Generic.List<OrderItem> { new OrderItem(plan.Id, BillingCycle.Monthly, 1, 100m) };
        var order = new OrderRequest(userId, items, null, 0, 100m, false);
        order.Pay();
        var orderId = order.Id;
        typeof(OrderItem).GetProperty("ServicePlan", BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic)!
            .SetValue(items[0], plan);

        _mockCurrentUserService.Setup(x => x.UserId).Returns(userId);
        _mockOrderRepository
            .Setup(x => x.GetByIdAsync(orderId, It.IsAny<CancellationToken>(), It.IsAny<System.Linq.Expressions.Expression<Func<OrderRequest, object>>[]>()))
            .ReturnsAsync(order);
        _mockCategoryRepository
            .Setup(x => x.GetByIdAsync(categoryId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ServiceCategory { Id = categoryId, Name = "Cloud VPS", Slug = "cloud-vps" });
        _mockPlanRepository
            .Setup(x => x.GetByIdAsync(plan.Id, It.IsAny<CancellationToken>(), It.IsAny<System.Linq.Expressions.Expression<Func<ServicePlan, object>>[]>()))
            .ReturnsAsync(plan);
        _mockRepositoryVpsInstance
            .Setup(x => x.FirstOrDefaultAsync(It.IsAny<System.Linq.Expressions.Expression<Func<VpsInstance, bool>>>(), It.IsAny<CancellationToken>(), It.IsAny<System.Linq.Expressions.Expression<Func<VpsInstance, object>>[]>()))
            .ReturnsAsync((VpsInstance?)null);
        _mockVpsProvisioningService
            .Setup(x => x.ProvisionAsync(It.IsAny<VpsProvisionSpec>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ProvisionResult(true, "container-123", "vps-nano-test", null));

        var resultList = await _handler.Handle(new ProvisionVpsCommand { OrderId = orderId }, CancellationToken.None);
        var result = resultList[0];

        result.ContainerId.Should().Be("container-123");
        result.CpuCores.Should().Be(2);
        result.RamMb.Should().Be(4096);
        result.DiskGb.Should().Be(40);
    }
}
