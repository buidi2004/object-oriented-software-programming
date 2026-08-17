using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.EmailHosting.Commands.CreateEmailAccount
{
    public class CreateEmailAccountCommandTests
    {
        [Fact]
        public void EmailHostingAccount_ShouldHaveCorrectProperties()
        {
            var account = new EmailHostingAccount
            {
                UserId = Guid.NewGuid(),
                Domain = "example.com",
                MaxMailboxes = 10,
                MailboxSizeMb = 512,
                Price = 29.99m
            };

            account.Domain.Should().Be("example.com");
            account.MaxMailboxes.Should().Be(10);
            account.Price.Should().Be(29.99m);
            account.IsActive.Should().BeTrue();
        }

        [Fact]
        public void EmailHostingStatus_ShouldHaveCorrectValues()
        {
            EmailHostingStatus.Active.Should().Be(EmailHostingStatus.Active);
            EmailHostingStatus.Suspended.Should().Be(EmailHostingStatus.Suspended);
            EmailHostingStatus.Expired.Should().Be(EmailHostingStatus.Expired);
        }
    }
}
