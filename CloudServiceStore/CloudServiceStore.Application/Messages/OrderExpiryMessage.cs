using System;

namespace CloudServiceStore.Application.Messages;

/// <summary>
/// Message kích hoạt luồng huỷ đơn hàng tự động sau khoảng thời gian TTL (mặc định 15 phút).
/// Được publish lên queue "orders.expiry" ngay khi đơn hàng được tạo với TTL 15 phút.
/// </summary>
public class OrderExpiryMessage
{
    public Guid OrderId { get; set; }
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
