using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Configuration;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Infrastructure;

public class AcmeProvisioningServiceTests
{
    private readonly Mock<ILogger<AcmeProvisioningService>> _loggerMock;
    private readonly Mock<ILogger<AcmeChallengeStore>> _challengeStoreLoggerMock;
    private readonly IOptions<AcmeSettings> _settings;
    private readonly IAcmeChallengeStore _challengeStore;
    private readonly AcmeProvisioningService _service;

    public AcmeProvisioningServiceTests()
    {
        _loggerMock = new Mock<ILogger<AcmeProvisioningService>>();
        _challengeStoreLoggerMock = new Mock<ILogger<AcmeChallengeStore>>();
        _settings = Options.Create(new AcmeSettings
        {
            Environment = "Staging",
            ContactEmail = "test-admin@cloudservicestore.local",
            StoragePath = "/tmp/test-acme-storage",
            TimeoutSeconds = 30
        });

        _challengeStore = new AcmeChallengeStore(_settings, _challengeStoreLoggerMock.Object);
        _service = new AcmeProvisioningService(_settings, _challengeStore, _loggerMock.Object);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData("invalid domain with spaces")]
    [InlineData("http://domain.com")]
    [InlineData("domain..com")]
    [InlineData("-invalid.com")]
    public async Task IssueCertificateAsync_InvalidDomain_ReturnsFailureWithErrorMessage(string invalidDomain)
    {
        // Act
        var result = await _service.IssueCertificateAsync(invalidDomain, "csr", CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().NotBeNullOrEmpty();
        result.Certificate.Should().BeEmpty();
        result.PrivateKey.Should().BeEmpty();
    }

    [Fact]
    public async Task IssueCertificateAsync_UnresolvableDomain_ReturnsDnsErrorMessageWithoutCallingAcme()
    {
        // Arrange - use a non-existent domain to trigger DNS pre-flight check
        var nonExistentDomain = "non-existent-domain-xyz-123456789.com";

        // Act
        var result = await _service.IssueCertificateAsync(nonExistentDomain, "csr", CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Contain("DNS");
        result.Certificate.Should().BeEmpty();
    }

    [Fact]
    public void AcmeChallengeStore_SetGetRemove_WorksCorrectly()
    {
        // Arrange
        var token = "test-token-12345";
        var keyAuthz = "test-token-12345.dummy-key-authz-67890";

        // Act & Assert Set/Get
        _challengeStore.SetChallenge(token, keyAuthz);
        _challengeStore.GetChallenge(token).Should().Be(keyAuthz);

        // Act & Assert Remove
        _challengeStore.RemoveChallenge(token);
        _challengeStore.GetChallenge(token).Should().BeNull();
    }
}
