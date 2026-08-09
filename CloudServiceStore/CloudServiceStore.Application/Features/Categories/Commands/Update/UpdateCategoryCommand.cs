using System;
using MediatR;
using FluentValidation;

namespace CloudServiceStore.Application.Features.Categories.Commands.Update;

public record UpdateCategoryCommand(Guid Id, string Name, string Slug) : IRequest;

public class UpdateCategoryCommandValidator : AbstractValidator<UpdateCategoryCommand>
{
    public UpdateCategoryCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Slug).NotEmpty().Matches("^[a-z0-9-]+$")
            .WithMessage("Slug chỉ chứa chữ thường, số và dấu gạch ngang.");
    }
}
