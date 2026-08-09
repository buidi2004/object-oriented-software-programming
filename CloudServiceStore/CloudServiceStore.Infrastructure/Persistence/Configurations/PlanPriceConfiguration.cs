using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class PlanPriceConfiguration : IEntityTypeConfiguration<PlanPrice>
{
    public void Configure(EntityTypeBuilder<PlanPrice> builder)
    {
        builder.Property(p => p.Price).HasColumnType("decimal(18,2)");
        builder.Property(p => p.Currency).IsRequired().HasMaxLength(10).HasDefaultValue("VND");

        // Updated: was (ServicePlanId, BillingCycle), now includes Currency
        builder.HasIndex(p => new { p.ServicePlanId, p.BillingCycle, p.Currency }).IsUnique();
    }
}
