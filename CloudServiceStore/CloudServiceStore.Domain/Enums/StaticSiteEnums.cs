namespace CloudServiceStore.Domain.Enums;

public enum DeployStatus
{
    Pending = 1,
    Building = 2,
    Success = 3,
    Failed = 4
}

public enum StaticSiteStatus
{
    Pending = 0,
    Provisioning = 1,
    Active = 2,
    Failed = 3
}
