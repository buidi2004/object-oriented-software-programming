using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace CloudServiceStore.Infrastructure.Services;

public class GeminiChatService : IChatBotService
{
    private readonly HttpClient _http;
    private readonly string _apiKey;
    private readonly string _model;

    public GeminiChatService(HttpClient http, IConfiguration config)
    {
        _http = http;
        _apiKey = config["Gemini:ApiKey"]!;
        _model = config["Gemini:Model"] ?? "gemini-2.5-flash";
    }

    public async Task<string> AskAsync(string userMessage, string context)
    {
        var systemPrompt = $@"
Bạn là trợ lý tư vấn của CloudServiceStore (CloudHost VN). 
CHỈ trả lời dựa trên dữ liệu sau, KHÔNG được bịa giá hay thông số không có trong dữ liệu:

{context}

Nếu câu hỏi ngoài phạm vi dữ liệu trên, hãy nói sẽ chuyển cho nhân viên hỗ trợ.
Trả lời ngắn gọn, thân thiện, bằng tiếng Việt.";

        var body = new
        {
            contents = new[]
            {
                new { parts = new[] { new { text = $"{systemPrompt}\n\nKhách hỏi: {userMessage}" } } }
            }
        };

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent?key={_apiKey}";
        
        try
        {
            var response = await _http.PostAsync(url,
                new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json"));

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                return $"API Error ({response.StatusCode}): {errorBody}";
            }

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            return doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString() ?? "Xin lỗi, tôi chưa trả lời được. Để tôi chuyển cho nhân viên hỗ trợ nhé.";
        }
        catch
        {
            return "Hệ thống đang bận, bạn chờ nhân viên tư vấn nhé.";
        }
    }
}
