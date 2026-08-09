using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.Categories.Queries.GetCategories;

public record GetCategoriesQuery : IRequest<List<CategoryDto>>;
public record CategoryDto(Guid Id, string Name, string Slug);
