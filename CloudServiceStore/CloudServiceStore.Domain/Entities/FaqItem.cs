using System;
using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Domain.Entities;

public class FaqItem : AggregateRoot
{
    public string Question { get; private set; }
    public string Answer { get; private set; }
    public string CategoryTag { get; private set; }
    public int DisplayOrder { get; private set; }

    private FaqItem() { } // EF Core

    public FaqItem(string question, string answer, string categoryTag, int displayOrder)
    {
        Id = Guid.NewGuid();
        Question = question;
        Answer = answer;
        CategoryTag = categoryTag;
        DisplayOrder = displayOrder;
    }

    public void Update(string question, string answer, string categoryTag, int displayOrder)
    {
        Question = question;
        Answer = answer;
        CategoryTag = categoryTag;
        DisplayOrder = displayOrder;
    }
}
