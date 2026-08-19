using System;
using MediatR;

namespace CloudServiceStore.Application.Features.ServiceTagNotes.Commands.UpdateServiceTagNote;

public record UpdateServiceTagNoteCommand(
    string ServiceType,
    Guid ServiceId,
    string? TagsJson,
    string? ColorHex,
    string? Note) : IRequest;
