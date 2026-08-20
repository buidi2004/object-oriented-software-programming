namespace CloudServiceStore.Application.Interfaces;

/// <summary>
/// Store for active ACME HTTP-01 challenge tokens and their key authorizations.
/// </summary>
public interface IAcmeChallengeStore
{
    /// <summary>
    /// Sets a challenge token and its corresponding key authorization.
    /// </summary>
    void SetChallenge(string token, string keyAuthorization);

    /// <summary>
    /// Gets the key authorization for a given challenge token.
    /// </summary>
    string? GetChallenge(string token);

    /// <summary>
    /// Removes a challenge token once validation is complete.
    /// </summary>
    void RemoveChallenge(string token);
}
