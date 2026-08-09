using CloudServiceStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class LoyaltyPointConfiguration : IEntityTypeConfiguration<LoyaltyPoint>
{
    public void Configure(EntityTypeBuilder<LoyaltyPoint> builder)
    {
        builder.ToTable("LoyaltyPoints");
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => x.UserId).IsUnique(); // 1 user = 1 balance record

        builder.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}
