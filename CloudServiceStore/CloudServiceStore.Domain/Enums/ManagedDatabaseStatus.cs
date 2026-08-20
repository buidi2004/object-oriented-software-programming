namespace CloudServiceStore.Domain.Enums;

public enum ManagedDatabaseStatus : long
{
    Pending = 0,
    Provisioning = 1,
    Running = 2,
    Failed = 3,
    Stopped = 4
}
