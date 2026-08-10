using CloudServiceStore.Application.Features.NewsArticles.Commands.Create;
using FluentValidation.TestHelper;
using Xunit;
using System;

namespace CloudServiceStore.Tests.Application.Features.NewsArticles;

public class CreateNewsArticleCommandValidatorTests
{
    private readonly CreateNewsArticleCommandValidator _validator;

    public CreateNewsArticleCommandValidatorTests()
    {
        _validator = new CreateNewsArticleCommandValidator();
    }

    [Fact]
    public void Validate_ValidCommand_ShouldNotHaveAnyErrors()
    {
        var command = new CreateNewsArticleCommand("Welcome", "welcome", new string('a', 50), Guid.NewGuid());
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_ShortContent_ShouldHaveError()
    {
        var command = new CreateNewsArticleCommand("Title", "slug", "short", Guid.NewGuid());
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Content);
    }

    [Fact]
    public void Validate_EmptyTitle_ShouldHaveError()
    {
        var command = new CreateNewsArticleCommand("", "slug", new string('a', 50), Guid.NewGuid());
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Title);
    }
}
