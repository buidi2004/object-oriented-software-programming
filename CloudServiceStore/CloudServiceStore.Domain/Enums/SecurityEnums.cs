namespace CloudServiceStore.Domain.Enums;

public enum SecurityAddonType
{
    Waf = 1,
    MalwareScan = 2
}

public enum SecurityScanStatus
{
    Scanning = 1,
    Clean = 2,
    ThreatsFound = 3,
    Failed = 4
}
