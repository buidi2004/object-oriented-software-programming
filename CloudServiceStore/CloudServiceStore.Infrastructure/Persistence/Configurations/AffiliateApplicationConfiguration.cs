using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class AffiliateApplicationConfiguration : IEntityTypeConfiguration<AffiliateApplication>
{
    public void Configure(EntityTypeBuilder<AffiliateApplication> builder)
    {
        builder.Property(a => a.CommissionRate).HasColumnType("decimal(5,2)");
    }
}
