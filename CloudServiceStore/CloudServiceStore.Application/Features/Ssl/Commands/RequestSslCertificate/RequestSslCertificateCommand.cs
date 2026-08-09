using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Ssl.Commands.RequestSslCertificate;
public record RequestSslCertificateCommand(Guid DomainId, string Csr) : IRequest<Guid>;
