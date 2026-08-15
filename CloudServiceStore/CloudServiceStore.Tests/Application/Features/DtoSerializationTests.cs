using System;
using System.Text.Json;
using CloudServiceStore.Application.Features.Users.Queries.GetProfile;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features
{
    [Trait("Category", "Unit")]
    public class DtoSerializationTests
    {
        [Fact]
        public void ProfileDto_ShouldSerializeToCamelCase()
        {
            // Arrange
            var dto = new ProfileDto(
                Id: Guid.Parse("11111111-1111-1111-1111-111111111111"),
                FullName: "John Doe",
                Email: "john@example.com",
                PhoneNumber: null,
                FirstName: "John",
                LastName: "Doe",
                Country: "US",
                City: "New York",
                Ward: null,
                AddressLine: "123 Main St",
                CompanyName: null,
                TaxCode: null,
                CreatedAt: new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            );

            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            // Act
            var json = JsonSerializer.Serialize(dto, options);

            // Assert
            Assert.Contains("\"id\":", json);
            Assert.Contains("\"fullName\":", json);
            Assert.Contains("\"email\":", json);
            Assert.Contains("\"firstName\":", json);
            Assert.Contains("\"createdAt\":", json);
            
            // Ensure no PascalCase is present for properties
            Assert.DoesNotContain("\"FullName\":", json);
            Assert.DoesNotContain("\"Email\":", json);
        }
    }
}
