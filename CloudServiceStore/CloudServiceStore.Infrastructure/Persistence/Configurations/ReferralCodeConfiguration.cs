using CloudServiceStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class ReferralCodeConfiguration : IEntityTypeConfiguration<ReferralCode>
{
    public void Configure(EntityTypeBuilder<ReferralCode> builder)
    {
        builder.ToTable("ReferralCodes");
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => x.UserId).IsUnique();  // 1 user = 1 code
        builder.HasIndex(x => x.Code).IsUnique();
        builder.Property(x => x.Code).IsRequired().HasMaxLength(20);

        builder.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}
