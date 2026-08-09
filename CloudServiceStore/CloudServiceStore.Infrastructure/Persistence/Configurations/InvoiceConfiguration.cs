using CloudServiceStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.ToTable("Invoices");
        
        builder.HasKey(x => x.Id);
        
        builder.HasIndex(x => x.InvoiceNumber).IsUnique();
        builder.Property(x => x.InvoiceNumber).IsRequired().HasMaxLength(50);
        
        builder.Property(x => x.PdfUrl).IsRequired().HasMaxLength(500);

        builder.HasOne(x => x.OrderRequest)
            .WithOne(o => o.Invoice)
            .HasForeignKey<Invoice>(x => x.OrderRequestId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
