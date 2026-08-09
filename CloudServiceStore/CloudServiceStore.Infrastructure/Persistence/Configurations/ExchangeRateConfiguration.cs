using CloudServiceStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class ExchangeRateConfiguration : IEntityTypeConfiguration<ExchangeRate>
{
    public void Configure(EntityTypeBuilder<ExchangeRate> builder)
    {
        builder.ToTable("ExchangeRates");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.FromCurrency).IsRequired().HasMaxLength(10);
        builder.Property(x => x.ToCurrency).IsRequired().HasMaxLength(10);
        builder.Property(x => x.Rate).HasColumnType("decimal(18,6)");

        // Each currency pair is unique
        builder.HasIndex(x => new { x.FromCurrency, x.ToCurrency }).IsUnique();
    }
}
