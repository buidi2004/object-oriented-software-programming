namespace CloudServiceStore.Application.Interfaces;

public interface IQrCodeGenerator
{
    string GenerateUrl(string data);
}
