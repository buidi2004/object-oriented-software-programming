using System.Collections.Generic;
using CloudServiceStore.Application.DTOs;
using MediatR;

namespace CloudServiceStore.Application.Features.ManagedDatabases.Queries.GetAdminDatabases;

public class GetAdminDatabasesQuery : IRequest<List<AdminDatabaseDto>>
{
}
