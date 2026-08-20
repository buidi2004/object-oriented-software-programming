using FluentValidation;

namespace CloudServiceStore.Application.Features.ObjectStorage.Commands.CreateBucket;

public class CreateBucketCommandValidator : AbstractValidator<CreateBucketCommand>
{
    public CreateBucketCommandValidator()
    {
        RuleFor(x => x.BucketName)
            .NotEmpty().WithMessage("BucketName không được để trống.")
            .Matches("^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$").WithMessage("BucketName không hợp lệ theo chuẩn DNS.")
            .MaximumLength(63).WithMessage("BucketName không được vượt quá 63 ký tự.");

        RuleFor(x => x.Region)
            .NotEmpty().WithMessage("Region không được để trống.")
            .MaximumLength(50).WithMessage("Region không được vượt quá 50 ký tự.");

        RuleFor(x => x.IdempotencyKey)
            .NotEmpty().WithMessage("IdempotencyKey là bắt buộc để chống tạo trùng.")
            .MaximumLength(450).WithMessage("IdempotencyKey không được vượt quá 450 ký tự.");
    }
}
