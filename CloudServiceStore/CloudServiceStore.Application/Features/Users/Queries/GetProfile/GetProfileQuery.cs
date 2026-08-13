using MediatR;

namespace CloudServiceStore.Application.Features.Users.Queries.GetProfile;

public record GetProfileQuery : IRequest<ProfileDto>;
