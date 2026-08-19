using System;
using MediatR;

namespace CloudServiceStore.Application.Features.ServiceTagNotes.Queries.GetServiceTagNotes;

public record ServiceTagNoteDto(
    string ServiceType,
    Guid ServiceId,
    string? TagsJson,
    string? ColorHex,
    string? Note,
    DateTime UpdatedAt);

public record GetServiceTagNotesQuery(string ServiceType, Guid ServiceId) : IRequest<ServiceTagNoteDto?>;
