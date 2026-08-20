using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Configuration;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Infrastructure;

public class MinioProvisioningServiceTests
{
    private readonly Mock<ILogger<MinioProvisioningService>> _loggerMock;
    private readonly IOptions<MinIOSettings> _settings;
    private readonly MinioProvisioningService _service;

    public MinioProvisioningServiceTests()
    {
        _loggerMock = new Mock<ILogger<MinioProvisioningService>>();
        _settings = Options.Create(new MinIOSettings
        {
            Endpoint = "localhost:9000",
            AccessKey = "minioadmin",
            SecretKey = "minioadmin",
            UseSSL = false
        });
        _service = new MinioProvisioningService(_settings, _loggerMock.Object);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData("ab")] // Too short (< 3)
    [InlineData("ThisHasUpperLetters")] // Uppercase not allowed
    [InlineData("bucket_with_underscores")] // Underscores not allowed in S3 DNS
    [InlineData("-startswithdash")]
    [InlineData("endswithdash-")]
    public async Task CreateBucketAsync_InvalidBucketName_ThrowsBadRequestException(string invalidBucketName)
    {
        // Act
        Func<Task> act = async () => await _service.CreateBucketAsync(invalidBucketName, "us-east-1", CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<BadRequestException>();
    }
}
