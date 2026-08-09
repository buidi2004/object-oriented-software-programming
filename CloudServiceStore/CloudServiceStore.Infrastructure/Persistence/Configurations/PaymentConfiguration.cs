using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.HasIndex(p => p.IdempotencyKey).IsUnique();
        builder.HasIndex(p => p.TransactionRef).IsUnique();
        builder.Property(p => p.IdempotencyKey).IsRequired().HasMaxLength(100);
        builder.HasOne(p => p.OrderRequest).WithOne(o => o.Payment).HasForeignKey<Payment>(p => p.OrderRequestId);
    }
}
