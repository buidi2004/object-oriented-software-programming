using CloudServiceStore.Domain.Entities;
using FluentAssertions;

namespace CloudServiceStore.Tests.DomainTests.Entities;

public class TeamFeatureEntitiesTests
{
    [Fact]
    public void Cart_ApplyBundleDiscount_ShouldClampValueAndClearIt()
    {
        var cart = new Cart(Guid.NewGuid());

        cart.ApplyBundleDiscount(120m);
        cart.BundleDiscountPercent.Should().Be(100m);

        cart.Clear();
        cart.BundleDiscountPercent.Should().Be(0m);
    }

    [Fact]
    public void FreeTrialRequest_ShouldRepresentThreeDayTrial()
    {
        var startsAt = DateTime.UtcNow;
        var trial = new FreeTrialRequest
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            ServicePlanId = Guid.NewGuid(),
            StartsAt = startsAt,
            ExpiresAt = startsAt.AddDays(3),
            Status = "Active"
        };

        (trial.ExpiresAt - trial.StartsAt).Should().Be(TimeSpan.FromDays(3));
        trial.Status.Should().Be("Active");
    }

    [Fact]
    public void NotificationSetting_ShouldStoreExtendedChannels()
    {
        var setting = new NotificationSetting
        {
            PhoneNumber = "0900000000",
            ZaloId = "zalo-user",
            TelegramChatId = "telegram-chat",
            SmsOnOrder = true,
            ZaloOnPromotion = true,
            TelegramOnAlert = true
        };

        setting.SmsOnOrder.Should().BeTrue();
        setting.ZaloOnPromotion.Should().BeTrue();
        setting.TelegramOnAlert.Should().BeTrue();
    }
}
