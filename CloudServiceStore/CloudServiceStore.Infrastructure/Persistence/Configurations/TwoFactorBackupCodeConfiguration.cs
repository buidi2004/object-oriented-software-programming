using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class TwoFactorBackupCodeConfiguration : IEntityTypeConfiguration<TwoFactorBackupCode>
{
    public void Configure(EntityTypeBuilder<TwoFactorBackupCode> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.CodeHash).IsRequired().HasMaxLength(256);
        builder.HasIndex(x => x.UserId);
        builder.HasOne(x => x.User)
               .WithMany()
               .HasForeignKey(x => x.UserId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
