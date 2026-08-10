using CloudServiceStore.Application.Features.Faqs.Commands.CreateFaqItem;
using FluentValidation.TestHelper;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Faqs;

public class CreateFaqItemCommandValidatorTests
{
    private readonly CreateFaqItemCommandValidator _validator;

    public CreateFaqItemCommandValidatorTests()
    {
        _validator = new CreateFaqItemCommandValidator();
    }

    [Fact]
    public void Validate_ValidCommand_ShouldNotHaveAnyErrors()
    {
        var command = new CreateFaqItemCommand("Valid Question?", "This is a sufficiently long valid answer.", "General", 1);
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_EmptyQuestion_ShouldHaveError()
    {
        var command = new CreateFaqItemCommand("", "This is a valid answer.", "General", 1);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Question);
    }

    [Fact]
    public void Validate_ShortAnswer_ShouldHaveError()
    {
        var command = new CreateFaqItemCommand("Valid Question?", "Short", "General", 1);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Answer);
    }

    [Fact]
    public void Validate_EmptyCategoryTag_ShouldHaveError()
    {
        var command = new CreateFaqItemCommand("Valid Question?", "This is a valid answer.", "", 1);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.CategoryTag);
    }
}
