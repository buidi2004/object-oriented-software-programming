using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Interfaces;
using Dapper;
using MediatR;

namespace CloudServiceStore.Application.Features.Categories.Queries.GetCategories;

public class GetCategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, List<CategoryDto>>
{
    private readonly IDapperContext _dapper;
    public GetCategoriesQueryHandler(IDapperContext dapper) => _dapper = dapper;

    public async Task<List<CategoryDto>> Handle(GetCategoriesQuery request, CancellationToken ct)
    {
        const string sql = "SELECT Id, Name, Slug FROM ServiceCategories ORDER BY Name";
        using var conn = _dapper.CreateConnection();
        var result = await conn.QueryAsync<CategoryDto>(sql);
        return result.ToList();
    }
}
