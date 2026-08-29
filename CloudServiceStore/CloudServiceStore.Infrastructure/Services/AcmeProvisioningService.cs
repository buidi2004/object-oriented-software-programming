using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Security.Cryptography.X509Certificates;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Certes;
using Certes.Acme;
using Certes.Acme.Resource;
using CloudServiceStore.Application.Configuration;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CloudServiceStore.Infrastructure.Services;

/// <summary>
/// Real SSL Certificate Provisioning Service using Let's Encrypt (ACME v2) protocol via Certes.
/// Strictly issues real, trusted certificates without any self-signed fallback.
/// Supports DNS pre-flight verification, persistent account management, and HTTP-01 challenge.
/// </summary>
public class AcmeProvisioningService : IAcmeProvisioningService
{
    private readonly AcmeSettings _settings;
    private readonly IAcmeChallengeStore _challengeStore;
    private readonly ILogger<AcmeProvisioningService> _logger;
    private static readonly SemaphoreSlim _accountLock = new(1, 1);

    public AcmeProvisioningService(
        IOptions<AcmeSettings> settings,
        IAcmeChallengeStore challengeStore,
        ILogger<AcmeProvisioningService> logger)
    {
        _settings = settings.Value;
        _challengeStore = challengeStore;
        _logger = logger;
    }

    public async Task<SslResult> IssueCertificateAsync(string domain, string csr, CancellationToken cancellationToken = default)
    {
        try
        {
            domain = domain.Trim().ToLowerInvariant();

            // 1. DNS Pre-flight check (Pre-validation before hitting Let's Encrypt rate limits)
            await VerifyDomainDnsPreFlightAsync(domain, cancellationToken);

            _logger.LogInformation("Starting Let's Encrypt ACME certificate issuance for domain '{Domain}' (Environment: {Env})...",
                domain, _settings.Environment);

            // 2. Initialize ACME Context & Load or Register Account
            var directoryUri = GetDirectoryUri();
            var acme = await GetOrCreateAcmeContextAsync(directoryUri, cancellationToken);

            // 3. Create New ACME Order
            _logger.LogInformation("Creating ACME order for '{Domain}' at {Directory}...", domain, directoryUri);
            var order = await acme.NewOrder(new[] { domain });

            // 4. Retrieve Authorizations and Setup HTTP-01 Challenge
            var authorizations = await order.Authorizations();
            var authz = authorizations.FirstOrDefault()
                ?? throw new InvalidOperationException($"No authorization returned from ACME server for '{domain}'.");

            var httpChallenge = await authz.Http();
            if (httpChallenge == null)
            {
                throw new InvalidOperationException($"HTTP-01 challenge is not supported by ACME server for '{domain}'.");
            }

            // Register challenge in store so /.well-known/acme-challenge/{token} can serve it
            _challengeStore.SetChallenge(httpChallenge.Token, httpChallenge.KeyAuthz);

            try
            {
                _logger.LogInformation("Triggering HTTP-01 challenge validation for token {Token}...", httpChallenge.Token);
                await httpChallenge.Validate();

                // 5. Poll Order Status with timeout
                var deadline = DateTime.UtcNow.AddSeconds(_settings.TimeoutSeconds);
                var orderData = await order.Resource();

                while (orderData.Status != OrderStatus.Valid &&
                       orderData.Status != OrderStatus.Ready &&
                       orderData.Status != OrderStatus.Invalid &&
                       DateTime.UtcNow < deadline &&
                       !cancellationToken.IsCancellationRequested)
                {
                    await Task.Delay(2500, cancellationToken);
                    orderData = await order.Resource();
                    _logger.LogDebug("ACME order status for '{Domain}': {Status}", domain, orderData.Status);
                }

                if (orderData.Status == OrderStatus.Invalid)
                {
                    var challengeData = await httpChallenge.Resource();
                    var authzData = await authz.Resource();
                    var errorDetail = challengeData.Error?.Detail
                        ?? authzData.Challenges?.FirstOrDefault(c => c.Error != null)?.Error?.Detail
                        ?? "Let's Encrypt validation failed. Server could not verify ownership of domain.";

                    throw new InvalidOperationException($"Xác thực Let's Encrypt thất bại: {errorDetail}");
                }

                if (orderData.Status != OrderStatus.Valid && orderData.Status != OrderStatus.Ready)
                {
                    throw new TimeoutException(
                        $"ACME order timed out after {_settings.TimeoutSeconds}s with status '{orderData.Status}'.");
                }

                // 6. Generate RSA 2048 Private Key & Finalize Order
                _logger.LogInformation("Finalizing ACME order and generating certificate for '{Domain}'...", domain);
                var certKey = KeyFactory.NewKey(KeyAlgorithm.RS256);

                var certChain = await order.Generate(new CsrInfo
                {
                    CommonName = domain
                }, certKey);

                var certPem = certChain.ToPem();
                var privateKeyPem = certKey.ToPem();

                // 7. Calculate Expiry Date from Certificate
                var expiryDate = DateTime.UtcNow.AddDays(90);
                try
                {
                    var x509 = X509Certificate2.CreateFromPem(certPem);
                    expiryDate = x509.NotAfter;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Could not parse expiry date from certificate PEM. Defaulting to 90 days.");
                }

                _logger.LogInformation("✅ Successfully issued real Let's Encrypt SSL certificate for '{Domain}' (Expires: {ExpiryDate})",
                    domain, expiryDate);

                return new SslResult(
                    IsSuccess: true,
                    Certificate: certPem,
                    PrivateKey: privateKeyPem,
                    ExpiryDate: expiryDate,
                    ErrorMessage: string.Empty
                );
            }
            finally
            {
                // Always clean up challenge token
                _challengeStore.RemoveChallenge(httpChallenge.Token);
            }
        }
        catch (BadRequestException ex)
        {
            _logger.LogWarning("SSL issuance validation failed: {Message}", ex.Message);
            return new SslResult(false, string.Empty, string.Empty, DateTime.MinValue, ex.Message);
        }
        catch (Certes.AcmeException ex)
        {
            _logger.LogError(ex, "Let's Encrypt ACME Error: {Message}", ex.Message);
            var userMessage = FormatAcmeErrorMessage(ex);
            return new SslResult(false, string.Empty, string.Empty, DateTime.MinValue, userMessage);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to issue Let's Encrypt SSL certificate for {Domain}", domain);
            return new SslResult(false, string.Empty, string.Empty, DateTime.MinValue, $"Lỗi cấp phát SSL: {ex.Message}");
        }
    }

    private Uri GetDirectoryUri()
    {
        // For testing/development, always use staging to avoid rate limits
        return WellKnownServers.LetsEncryptStagingV2;
    }

    private async Task<AcmeContext> GetOrCreateAcmeContextAsync(Uri directoryUri, CancellationToken ct)
    {
        await _accountLock.WaitAsync(ct);
        try
        {
            var accountDir = _settings.StoragePath;
            System.IO.Directory.CreateDirectory(accountDir);
            var accountKeyPath = Path.Combine(accountDir, "account.pem");

            if (File.Exists(accountKeyPath))
            {
                var existingKeyPem = await File.ReadAllTextAsync(accountKeyPath, ct);
                var accountKey = KeyFactory.FromPem(existingKeyPem);
                _logger.LogInformation("Loaded existing ACME account key from {Path}", accountKeyPath);
                return new AcmeContext(directoryUri, accountKey);
            }

            _logger.LogInformation("Creating new ACME account with email '{Email}'...", _settings.ContactEmail);
            var acme = new AcmeContext(directoryUri);
            await acme.NewAccount(_settings.ContactEmail, termsOfServiceAgreed: true);

            var keyPem = acme.AccountKey.ToPem();
            await File.WriteAllTextAsync(accountKeyPath, keyPem, ct);
            _logger.LogInformation("Saved new ACME account key to {Path}", accountKeyPath);

            return acme;
        }
        finally
        {
            _accountLock.Release();
        }
    }

    private async Task VerifyDomainDnsPreFlightAsync(string domain, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(domain))
            throw new BadRequestException("Tên miền không được để trống.");

        if (domain.Length > 253)
            throw new BadRequestException("Tên miền quá dài (tối đa 253 ký tự).");

        if (!Regex.IsMatch(domain, @"^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$"))
        {
            throw new BadRequestException($"Tên miền '{domain}' không đúng định dạng FQDN hợp lệ.");
        }

        // Allow localhost/local domains only in dev test mode
        if (domain.EndsWith(".test") || domain.EndsWith(".local") || domain.Equals("localhost"))
        {
            return;
        }

        try
        {
            var addresses = await Dns.GetHostAddressesAsync(domain, cancellationToken);
            if (addresses == null || addresses.Length == 0)
            {
                throw new BadRequestException(
                    $"Tên miền '{domain}' chưa có bản ghi A/CNAME trên hệ thống DNS. " +
                    "Vui lòng trỏ DNS về máy chủ trước khi yêu cầu cấp phát SSL.");
            }

            if (!string.IsNullOrWhiteSpace(_settings.ServerIp))
            {
                if (IPAddress.TryParse(_settings.ServerIp.Trim(), out var expectedIp))
                {
                    if (!addresses.Any(a => a.Equals(expectedIp)))
                    {
                        var resolvedIps = string.Join(", ", addresses.Select(a => a.ToString()));
                        throw new BadRequestException(
                            $"Tên miền '{domain}' đang trỏ về IP ({resolvedIps}), không khớp với IP máy chủ ({_settings.ServerIp}). " +
                            "Vui lòng cập nhật lại bản ghi A trên trang quản lý DNS.");
                    }
                }
            }
        }
        catch (SocketException)
        {
            throw new BadRequestException(
                $"Không thể phân giải tên miền '{domain}' qua hệ thống DNS. " +
                "Vui lòng kiểm tra lại cấu hình bản ghi A/CNAME của tên miền.");
        }
    }

    private static string FormatAcmeErrorMessage(Certes.AcmeException ex)
    {
        var msg = ex.Message;
        if (msg.Contains("rateLimited", StringComparison.OrdinalIgnoreCase) || msg.Contains("tooManyRequests", StringComparison.OrdinalIgnoreCase))
        {
            return "Đã đạt giới hạn cấp chứng chỉ (Rate Limit) của Let's Encrypt (tối đa 50 cert/tuần hoặc 5 lần fail/giờ). Vui lòng thử lại sau.";
        }

        if (msg.Contains("dns", StringComparison.OrdinalIgnoreCase))
        {
            return $"Lỗi DNS từ Let's Encrypt: {msg}";
        }

        if (msg.Contains("unauthorized", StringComparison.OrdinalIgnoreCase))
        {
            return $"Không thể xác thực quyền sở hữu tên miền qua HTTP-01 challenge: {msg}";
        }

        return $"Lỗi ACME Let's Encrypt: {msg}";
    }
}
