using System.Collections.Generic;
using MediatR;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Application.Features.Ssl.Queries.GetMySslCertificates;
public record GetMySslCertificatesQuery : IRequest<IEnumerable<SslCertificate>>;
