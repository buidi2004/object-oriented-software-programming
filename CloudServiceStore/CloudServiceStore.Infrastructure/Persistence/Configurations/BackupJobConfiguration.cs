using CloudServiceStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class BackupJobConfiguration : IEntityTypeConfiguration<BackupJob>
{
    public void Configure(EntityTypeBuilder<BackupJob> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.BackupUrl).HasMaxLength(1000);
        
        builder.HasOne(x => x.OrderRequest)
               .WithMany()
               .HasForeignKey(x => x.OrderRequestId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
