using CloudServiceStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class ApiKeyConfiguration : IEntityTypeConfiguration<ApiKey>
{
    public void Configure(EntityTypeBuilder<ApiKey> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.KeyHash).IsRequired().HasMaxLength(256);
        builder.Property(x => x.Scopes).HasMaxLength(500);
        // User relation is loose (Guid UserId) so no navigation property defined
    }
}
