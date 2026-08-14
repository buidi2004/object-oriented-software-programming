using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class OrderRequestConfiguration : IEntityTypeConfiguration<OrderRequest>
{
    public void Configure(EntityTypeBuilder<OrderRequest> builder)
    {
        builder.Property(o => o.DiscountAmount).HasColumnType("decimal(18,2)");
        builder.Property(o => o.SubTotal).HasColumnType("decimal(18,2)");
        builder.Property(o => o.TotalAmount).HasColumnType("decimal(18,2)");
        builder.HasOne(o => o.User).WithMany().HasForeignKey(o => o.UserId).OnDelete(DeleteBehavior.Restrict);
        builder.Metadata.FindNavigation(nameof(OrderRequest.Items))?.SetPropertyAccessMode(PropertyAccessMode.Field);
    }
}
