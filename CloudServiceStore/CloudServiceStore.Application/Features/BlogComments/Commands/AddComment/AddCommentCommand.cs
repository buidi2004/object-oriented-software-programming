using System;
using FluentValidation;
using MediatR;

namespace CloudServiceStore.Application.Features.BlogComments.Commands.AddComment;

public record AddCommentCommand(Guid ArticleId, string Content) : IRequest<Guid>;

public class AddCommentCommandValidator : AbstractValidator<AddCommentCommand>
{
    public AddCommentCommandValidator()
    {
        RuleFor(x => x.ArticleId).NotEmpty();
        RuleFor(x => x.Content).NotEmpty().MaximumLength(1000);
    }
}
