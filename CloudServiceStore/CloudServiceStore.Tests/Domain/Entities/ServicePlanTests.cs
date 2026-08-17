using System;
using Xunit;
using FluentAssertions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.DomainTests.Entities;

public class ServicePlanTests
{
    [Fact]
    public void UpdateOpenGraphImage_ShouldUpdateProperty()
    {
        // Arrange
        var categoryId = Guid.NewGuid();
        var plan = new ServicePlan(categoryId, "Test Plan", "2 vCPU", "4 GB", "50 GB", "Unmetered", "qrcode");
        var imageUrl = "/images/products/og/test.png";

        // Act
        plan.UpdateOpenGraphImage(imageUrl);

        // Assert
        plan.OpenGraphImage.Should().Be(imageUrl);
    }
}
