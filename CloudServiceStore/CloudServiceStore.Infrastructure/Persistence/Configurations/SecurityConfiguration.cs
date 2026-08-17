using CloudServiceStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class SecuritySubscriptionConfiguration : IEntityTypeConfiguration<SecuritySubscription>
{
    public void Configure(EntityTypeBuilder<SecuritySubscription> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.TargetResourceId).IsRequired().HasMaxLength(255);
        builder.Property(x => x.AddonType).HasConversion<long>();
        builder.HasIndex(x => new { x.UserId, x.TargetResourceId, x.AddonType });
    }
}
