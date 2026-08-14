using System;
using MediatR;

namespace CloudServiceStore.Application.Features.BlogComments.Commands.DeleteComment;

public record DeleteCommentCommand(Guid Id) : IRequest;
