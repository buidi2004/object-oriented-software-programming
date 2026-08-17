using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public enum DatabaseEngine
{
    MySQL = 1,
    PostgreSQL = 2
}

public enum DatabaseInstanceStatus
{
    Creating = 1,
    Running = 2,
    Stopped = 3,
    Failed = 4
}
