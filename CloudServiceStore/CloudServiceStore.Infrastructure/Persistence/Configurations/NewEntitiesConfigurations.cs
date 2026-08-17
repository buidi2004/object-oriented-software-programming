using CloudServiceStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class AppTemplateConfiguration : IEntityTypeConfiguration<AppTemplate>
{
    public void Configure(EntityTypeBuilder<AppTemplate> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(255);
        builder.Property(x => x.Description).HasMaxLength(1000);
        builder.Property(x => x.DockerImage).HasMaxLength(255);
        builder.Property(x => x.Category).HasMaxLength(100);
    }
}

public class AppInstallationConfiguration : IEntityTypeConfiguration<AppInstallation>
{
    public void Configure(EntityTypeBuilder<AppInstallation> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ContainerId).HasMaxLength(255);
        builder.Property(x => x.InstallUrl).HasMaxLength(500);
        
        builder.HasOne(x => x.User)
               .WithMany()
               .HasForeignKey(x => x.UserId)
               .OnDelete(DeleteBehavior.Restrict);
               
        builder.HasOne(x => x.Template)
               .WithMany()
               .HasForeignKey(x => x.TemplateId)
               .OnDelete(DeleteBehavior.Restrict);
               
        builder.HasOne(x => x.HostingAccount)
               .WithMany()
               .HasForeignKey(x => x.HostingAccountId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}

public class DatabaseInstanceConfiguration : IEntityTypeConfiguration<DatabaseInstance>
{
    public void Configure(EntityTypeBuilder<DatabaseInstance> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(255);
        builder.Property(x => x.Version).HasMaxLength(50);
        builder.Property(x => x.ConnectionString).HasMaxLength(1000);
        
        builder.HasOne(x => x.User)
               .WithMany()
               .HasForeignKey(x => x.UserId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}

public class GameServerInstanceConfiguration : IEntityTypeConfiguration<GameServerInstance>
{
    public void Configure(EntityTypeBuilder<GameServerInstance> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ContainerId).HasMaxLength(255);
        builder.Property(x => x.ServerName).HasMaxLength(255);
        
        builder.HasOne(x => x.User)
               .WithMany()
               .HasForeignKey(x => x.UserId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}

public class StorageBucketConfiguration : IEntityTypeConfiguration<StorageBucket>
{
    public void Configure(EntityTypeBuilder<StorageBucket> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(255);
        
        builder.HasOne(x => x.User)
               .WithMany()
               .HasForeignKey(x => x.UserId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}

public class StorageObjectConfiguration : IEntityTypeConfiguration<StorageObject>
{
    public void Configure(EntityTypeBuilder<StorageObject> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Key).IsRequired().HasMaxLength(500);
        builder.Property(x => x.ContentType).HasMaxLength(100);
        
        builder.HasOne(x => x.Bucket)
               .WithMany()
               .HasForeignKey(x => x.BucketId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
