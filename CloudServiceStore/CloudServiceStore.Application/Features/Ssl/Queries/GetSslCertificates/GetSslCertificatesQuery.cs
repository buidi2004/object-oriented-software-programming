using System;
using System.Collections.Generic;
using MediatR;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Application.Features.Ssl.Queries.GetSslCertificates;

public class GetSslCertificatesQuery : IRequest<IEnumerable<SslCertificate>>
{
}
