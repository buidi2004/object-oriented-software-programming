using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.Property(a => a.IpAddress).HasMaxLength(45); // IPv6 max length
        builder.Property(a => a.Details).HasColumnType("nvarchar(max)").IsRequired(false);
    }
}
