using CloudServiceStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class DnsRecordConfiguration : IEntityTypeConfiguration<DnsRecord>
{
    public void Configure(EntityTypeBuilder<DnsRecord> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Type).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(255);
        builder.Property(x => x.Value).IsRequired().HasMaxLength(1000);
        
        builder.HasOne(x => x.Domain)
               .WithMany()
               .HasForeignKey(x => x.DomainId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
