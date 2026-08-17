using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Domain.Entities;

public enum GameType
{
    Minecraft = 1,
    CS2 = 2,
    Ark = 3,
    Rust = 4
}

public enum GameServerStatus
{
    Creating = 1,
    Running = 2,
    Stopped = 3,
    Failed = 4
}
