using System;
using System.Collections.Generic;
using CloudServiceStore.Domain.Events;

namespace CloudServiceStore.Domain.Primitives;

public abstract class Entity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    private readonly List<IDomainEvent> _domainEvents = new();

    public IReadOnlyCollection<IDomainEvent> GetDomainEvents() => _domainEvents.AsReadOnly();

    public void ClearDomainEvents() => _domainEvents.Clear();

    protected void RaiseDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    public static bool operator ==(Entity? first, Entity? second)
    {
        if (first is null && second is null)
            return true;
        if (first is null || second is null)
            return false;
        return first.Equals(second);
    }

    public static bool operator !=(Entity? first, Entity? second)
    {
        return !(first == second);
    }

    public override bool Equals(object? obj)
    {
        if (obj is null)
        {
            return false;
        }

        if (obj.GetType() != GetType())
        {
            return false;
        }

        if (obj is not Entity entity)
        {
            return false;
        }

        return entity.Id == Id;
    }

    public override int GetHashCode()
    {
        return Id.GetHashCode() * 41;
    }
}
