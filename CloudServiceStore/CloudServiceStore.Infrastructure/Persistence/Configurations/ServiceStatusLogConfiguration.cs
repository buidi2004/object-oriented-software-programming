using CloudServiceStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class ServiceStatusLogConfiguration : IEntityTypeConfiguration<ServiceStatusLog>
{
    public void Configure(EntityTypeBuilder<ServiceStatusLog> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.HasOne(x => x.ServicePlan)
               .WithMany()
               .HasForeignKey(x => x.ServicePlanId)
               .OnDelete(DeleteBehavior.SetNull);
               
        builder.HasOne(x => x.OrderRequest)
               .WithMany()
               .HasForeignKey(x => x.OrderRequestId)
               .OnDelete(DeleteBehavior.SetNull);
    }
}
