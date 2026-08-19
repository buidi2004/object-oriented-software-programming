using CloudServiceStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class ManagedDatabaseConfiguration : IEntityTypeConfiguration<ManagedDatabaseInstance>
{
    public void Configure(EntityTypeBuilder<ManagedDatabaseInstance> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);
        
        builder.HasIndex(x => x.IdempotencyKey).IsUnique();
        
        builder.Property(x => x.Engine).HasConversion<long>();
        builder.Property(x => x.Status).HasConversion<long>();

        builder.HasOne(x => x.User)
               .WithMany()
               .HasForeignKey(x => x.UserId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
