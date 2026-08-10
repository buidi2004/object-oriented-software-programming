using CloudServiceStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class MigrationRequestConfiguration : IEntityTypeConfiguration<MigrationRequest>
{
    public void Configure(EntityTypeBuilder<MigrationRequest> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.FromProvider).HasMaxLength(255);
        builder.Property(x => x.Note).HasMaxLength(1000);
    }
}
