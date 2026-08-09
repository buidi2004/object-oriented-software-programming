using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Interfaces;

public interface IQrCodeGeneratorFactory
{
    IQrCodeGenerator CreateGenerator(QrCodeType type);
}
