namespace CloudServiceStore.Application.Configuration;

public class EmailSettings
{
    public const string SectionName = "EmailSettings";
    public string SmtpHost { get; set; } = "smtp.gmail.com";
    public int SmtpPort { get; set; } = 587;
    public string SenderEmail { get; set; } = string.Empty;
    public string SenderPassword { get; set; } = string.Empty;
    public string SenderName { get; set; } = "CloudHost VN";
}
