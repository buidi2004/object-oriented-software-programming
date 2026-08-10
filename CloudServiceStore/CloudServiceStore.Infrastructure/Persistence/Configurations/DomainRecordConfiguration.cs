using CloudServiceStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class DomainRecordConfiguration : IEntityTypeConfiguration<DomainRecord>
{
    public void Configure(EntityTypeBuilder<DomainRecord> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(255);
        
        builder.HasOne(x => x.User)
               .WithMany()
               .HasForeignKey(x => x.UserId)
               .OnDelete(DeleteBehavior.Restrict);
               
        builder.HasOne(x => x.OrderRequest)
               .WithMany()
               .HasForeignKey(x => x.OrderRequestId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
