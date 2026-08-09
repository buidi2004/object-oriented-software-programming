using System;
using FluentValidation;
using MediatR;

namespace CloudServiceStore.Application.Features.Categories.Commands.Create;

public record CreateCategoryCommand(string Name, string Slug) : IRequest<Guid>;

public class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Slug).NotEmpty().Matches("^[a-z0-9-]+$")
            .WithMessage("Slug chỉ chứa chữ thường, số và dấu gạch ngang.");
    }
}
