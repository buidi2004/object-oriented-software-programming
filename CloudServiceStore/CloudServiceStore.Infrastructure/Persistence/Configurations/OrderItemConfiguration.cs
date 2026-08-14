using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.HasKey(oi => oi.Id);
        builder.Property(oi => oi.Price).HasColumnType("decimal(18,2)");
        builder.HasOne(oi => oi.ServicePlan).WithMany().HasForeignKey(oi => oi.ServicePlanId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(oi => oi.OrderRequest).WithMany(o => o.Items).HasForeignKey(oi => oi.OrderRequestId).OnDelete(DeleteBehavior.Cascade);
    }
}
