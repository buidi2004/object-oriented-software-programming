namespace CloudServiceStore.Domain.Primitives;

public abstract class AggregateRoot : Entity
{
    // AggregateRoot is just a marker to ensure repositories only work with Aggregate Roots.
    // It arleady inherits Id and DomainEvents from Entity.
}
