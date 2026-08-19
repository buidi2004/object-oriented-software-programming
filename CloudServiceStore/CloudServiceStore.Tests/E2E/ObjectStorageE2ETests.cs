using System;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.ObjectStorage.Commands.CreateBucket;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class ObjectStorageE2ETests : BaseE2ETest
{
    public ObjectStorageE2ETests(E2EWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreateBucket_MissingFields_Returns400()
    {
        // Arrange
        var token = await RegisterAndLoginCustomerAsync("minio_test1@test.com", "Password123!");
        Client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        var command = new CreateBucketCommand("", "", "");

        // Act
        var response = await Client.PostAsJsonAsync("/api/object-storage/buckets", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("BucketName");
        content.Should().Contain("IdempotencyKey");
    }

    [Fact]
    public async Task CreateBucket_Idempotency_ReturnsSameIdOr200()
    {
        // Arrange
        var token = await RegisterAndLoginCustomerAsync("minio_test2@test.com", "Password123!");
        Client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        var idempotencyKey = Guid.NewGuid().ToString();
        var command1 = new CreateBucketCommand("my-first-bucket", "ap-southeast-1", idempotencyKey);

        // Act 1: Call lầ 1
        var response1 = await Client.PostAsJsonAsync("/api/object-storage/buckets", command1);
        response1.EnsureSuccessStatusCode();
        var result1 = await response1.Content.ReadFromJsonAsync<dynamic>();
        string bucketId1 = result1?.GetProperty("bucketId").GetString() ?? "";

        // Act 2: Call lần 2 với CÙNG IdempotencyKey nhưng tên bucket khác
        var command2 = new CreateBucketCommand("my-second-bucket", "us-east-1", idempotencyKey);
        var response2 = await Client.PostAsJsonAsync("/api/object-storage/buckets", command2);

        // Assert
        response2.EnsureSuccessStatusCode();
        var result2 = await response2.Content.ReadFromJsonAsync<dynamic>();
        string bucketId2 = result2?.GetProperty("bucketId").GetString() ?? "";

        // Phải trả về cùng 1 ID, không tạo mới
        bucketId2.Should().Be(bucketId1);
    }
}
