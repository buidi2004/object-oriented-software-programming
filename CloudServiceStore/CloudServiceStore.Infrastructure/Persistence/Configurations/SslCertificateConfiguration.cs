using CloudServiceStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class SslCertificateConfiguration : IEntityTypeConfiguration<SslCertificate>
{
    public void Configure(EntityTypeBuilder<SslCertificate> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Csr).IsRequired();
        builder.HasIndex(x => x.IdempotencyKey).IsUnique();
        builder.Property(x => x.Status).HasConversion<long>();
        
        builder.HasOne(x => x.Domain)
               .WithMany()
               .HasForeignKey(x => x.DomainId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
