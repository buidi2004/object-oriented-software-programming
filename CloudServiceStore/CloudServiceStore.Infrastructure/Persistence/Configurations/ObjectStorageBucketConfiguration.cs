using CloudServiceStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class ObjectStorageBucketConfiguration : IEntityTypeConfiguration<ObjectStorageBucket>
{
    public void Configure(EntityTypeBuilder<ObjectStorageBucket> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.BucketName).IsRequired().HasMaxLength(63);
        builder.HasIndex(x => x.BucketName).IsUnique();

        builder.Property(x => x.Region).IsRequired().HasMaxLength(50);
        
        builder.HasIndex(x => x.IdempotencyKey).IsUnique();
        
        builder.Property(x => x.Status).HasConversion<long>();

        builder.HasOne(x => x.User)
               .WithMany()
               .HasForeignKey(x => x.UserId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
