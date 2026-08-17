using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.StorageBuckets.Commands.CreateBucket
{
    public class CreateBucketCommandTests
    {
        [Fact]
        public void StorageBucket_ShouldHaveCorrectDefaults()
        {
            var bucket = new StorageBucket
            {
                UserId = System.Guid.NewGuid(),
                Name = "my-bucket",
                Visibility = BucketVisibility.Private
            };

            bucket.SizeBytes.Should().Be(0);
            bucket.IsActive.Should().BeTrue();
            bucket.CreatedAt.Should().BeCloseTo(System.DateTime.UtcNow, TimeSpan.FromSeconds(1));
        }

        [Fact]
        public void BucketVisibility_EnumValues_ShouldBeCorrect()
        {
            ((int)BucketVisibility.Private).Should().Be(1);
            ((int)BucketVisibility.Public).Should().Be(2);
        }
    }
}
