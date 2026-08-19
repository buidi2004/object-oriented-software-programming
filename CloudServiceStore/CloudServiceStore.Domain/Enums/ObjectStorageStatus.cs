namespace CloudServiceStore.Domain.Enums;

public enum ObjectStorageStatus : long
{
    Pending = 0,
    Provisioning = 1,
    Active = 2,
    Failed = 3
}
