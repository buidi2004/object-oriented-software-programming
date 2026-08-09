using System;
using MediatR;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Application.Features.Ssl.Queries.GetSslCertificateById;
public record GetSslCertificateByIdQuery(Guid Id) : IRequest<SslCertificate>;
