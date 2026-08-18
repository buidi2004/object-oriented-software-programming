using System;
using System.Text.Json.Serialization;

namespace CloudServiceStore.Application.DTOs;

public class SePayWebhookPayload
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("gateway")]
    public string Gateway { get; set; } = string.Empty;

    [JsonPropertyName("transactionDate")]
    public string? TransactionDate { get; set; }

    [JsonPropertyName("accountNumber")]
    public string? AccountNumber { get; set; }

    [JsonPropertyName("code")]
    public string? Code { get; set; }

    [JsonPropertyName("content")]
    public string Content { get; set; } = string.Empty;

    [JsonPropertyName("transferType")]
    public string TransferType { get; set; } = string.Empty;

    [JsonPropertyName("transferAmount")]
    public decimal TransferAmount { get; set; }

    [JsonPropertyName("accumulated")]
    public decimal Accumulated { get; set; }

    [JsonPropertyName("subAccount")]
    public string? SubAccount { get; set; }

    [JsonPropertyName("referenceCode")]
    public string? ReferenceCode { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }
}
