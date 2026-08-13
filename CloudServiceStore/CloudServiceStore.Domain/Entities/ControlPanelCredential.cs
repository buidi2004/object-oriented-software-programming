using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class ControlPanelCredential : AggregateRoot
{
    public Guid OrderId { get; private set; }
    public string PanelType { get; private set; } = null!;
    public string Url { get; private set; } = null!;
    public string Username { get; private set; } = null!;
    public string Password { get; private set; } = null!;

    private ControlPanelCredential() { } // EF Core

    public ControlPanelCredential(Guid orderId, string panelType, string url, string username, string password)
    {
        Id = Guid.NewGuid();
        OrderId = orderId;
        PanelType = panelType;
        Url = url;
        Username = username;
        Password = password;
    }

    public void Update(string panelType, string url, string username, string password)
    {
        PanelType = panelType;
        Url = url;
        Username = username;
        Password = password;
    }
}
