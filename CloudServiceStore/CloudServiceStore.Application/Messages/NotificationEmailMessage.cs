using System;

namespace CloudServiceStore.Application.Messages;

/// <summary>
/// Message kích hoạt gửi email phi đồng bộ qua queue "notifications.email".
/// Consumer sẽ thực hiện gửi với retry + exponential backoff khi SMTP lỗi.
/// </summary>
public class NotificationEmailMessage
{
    public string ToEmail { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string HtmlBody { get; set; } = string.Empty;

    /// <summary>1 = thấp, 5 = cao (mặc định 3 = normal)</summary>
    public int Priority { get; set; } = 3;

    public DateTime EnqueuedAt { get; set; } = DateTime.UtcNow;
    public Guid? RelatedOrderId { get; set; }
}
