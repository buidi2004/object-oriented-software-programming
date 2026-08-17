using System;
using Xunit;
using FluentAssertions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.DomainTests.Entities;

public class AppUserTests
{
    [Fact]
    public void UpdateAvatarUrl_ShouldUpdateProperty()
    {
        // Arrange
        var roleId = Guid.NewGuid();
        var user = new AppUser(
            "Full Name",
            "test@test.com",
            "passwordHash",
            roleId);

        var newAvatarUrl = "/images/avatars/test.png";

        // Act
        user.UpdateAvatarUrl(newAvatarUrl);

        // Assert
        user.AvatarUrl.Should().Be(newAvatarUrl);
    }
}
