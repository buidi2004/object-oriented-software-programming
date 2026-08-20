using System;
using System.Security.Cryptography.X509Certificates;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Infrastructure;

public class AcmeProvisioningServiceTests
{
    private readonly Mock<ILogger<AcmeProvisioningService>> _loggerMock;
    private readonly AcmeProvisioningService _service;

    public AcmeProvisioningServiceTests()
    {
        _loggerMock = new Mock<ILogger<AcmeProvisioningService>>();
        _service = new AcmeProvisioningService(_loggerMock.Object);
    }

    [Fact]
    public async Task IssueCertificateAsync_ValidDomain_GeneratesValidX509Certificate()
    {
        // Arrange
        var domain = "mycloudvps.vn";
        var csr = "dummy-csr-string";

        // Act
        var result = await _service.IssueCertificateAsync(domain, csr, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeTrue();
        result.Certificate.Should().StartWith("-----BEGIN CERTIFICATE-----");
        result.PrivateKey.Should().StartWith("-----BEGIN PRIVATE KEY-----");
        result.ExpiryDate.Should().BeAfter(DateTime.UtcNow.AddDays(80));

        // Validate that certificate can be parsed by X509Certificate2
        var cert = X509Certificate2.CreateFromPem(result.Certificate);
        cert.Should().NotBeNull();
        cert.Subject.Should().Contain(domain);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData("invalid domain with spaces")]
    [InlineData("http://domain.com")]
    [InlineData("domain..com")]
    public async Task IssueCertificateAsync_InvalidDomain_ReturnsFailureWithErrorMessage(string invalidDomain)
    {
        // Act
        var result = await _service.IssueCertificateAsync(invalidDomain, "csr", CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().NotBeNullOrEmpty();
    }
}
