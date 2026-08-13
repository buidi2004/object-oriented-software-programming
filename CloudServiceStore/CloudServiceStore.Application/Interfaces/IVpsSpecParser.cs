using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Application.Interfaces;

public interface IVpsSpecParser
{
    (int CpuCores, long MemoryBytes, int? DiskGb) Parse(ServicePlan plan);
}
