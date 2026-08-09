using System;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Infrastructure.ExternalServices.QrCode;

public class ServicePlanQrCodeGenerator : IQrCodeGenerator
{
    public string GenerateUrl(string data)
    {
        return $"https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=plan_{data}";
    }
}

public class OrderQrCodeGenerator : IQrCodeGenerator
{
    public string GenerateUrl(string data)
    {
        return $"https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=order_{data}";
    }
}

public class QrCodeGeneratorFactory : IQrCodeGeneratorFactory
{
    public IQrCodeGenerator CreateGenerator(QrCodeType type)
    {
        return type switch
        {
            QrCodeType.ServicePlan => new ServicePlanQrCodeGenerator(),
            QrCodeType.OrderRequest => new OrderQrCodeGenerator(),
            _ => throw new ArgumentException("Invalid QR code type", nameof(type))
        };
    }
}
