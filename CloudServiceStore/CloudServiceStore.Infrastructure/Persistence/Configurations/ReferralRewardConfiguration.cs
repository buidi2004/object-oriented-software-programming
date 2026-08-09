using CloudServiceStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class ReferralRewardConfiguration : IEntityTypeConfiguration<ReferralReward>
{
    public void Configure(EntityTypeBuilder<ReferralReward> builder)
    {
        builder.ToTable("ReferralRewards");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.RewardAmount).HasColumnType("decimal(18,2)");
        builder.Property(x => x.Status).IsRequired().HasMaxLength(20);

        // Prevent duplicate: referrer cannot reward the same referred user twice
        builder.HasIndex(x => new { x.ReferrerUserId, x.ReferredUserId }).IsUnique();

        builder.HasOne(x => x.Referrer).WithMany().HasForeignKey(x => x.ReferrerUserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Referred).WithMany().HasForeignKey(x => x.ReferredUserId).OnDelete(DeleteBehavior.Restrict);
    }
}
