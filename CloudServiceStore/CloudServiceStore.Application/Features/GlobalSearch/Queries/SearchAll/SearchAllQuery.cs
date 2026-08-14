using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.GlobalSearch.Queries.SearchAll;

public record SearchResultItem(Guid Id, string Type, string Title, string Description, string? Slug = null);

public record SearchAllQuery(string Keyword) : IRequest<IReadOnlyList<SearchResultItem>>;
