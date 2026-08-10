using CloudServiceStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class WishlistItemConfiguration : IEntityTypeConfiguration<WishlistItem>
{
    public void Configure(EntityTypeBuilder<WishlistItem> builder)
    {
        builder.ToTable("WishlistItems");
        builder.HasKey(x => x.Id);

        // A user can only add a specific plan to their wishlist once
        builder.HasIndex(x => new { x.UserId, x.ServicePlanId }).IsUnique();

        builder.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.ServicePlan).WithMany().HasForeignKey(x => x.ServicePlanId).OnDelete(DeleteBehavior.Cascade);
    }
}
