using System;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Configuration;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;

namespace CloudServiceStore.Infrastructure.Services;

/// <summary>
/// Real MinIO-based object storage provisioning.
/// Creates buckets on a shared self-hosted MinIO instance for each customer.
/// </summary>
public class MinioProvisioningService : IMinioProvisioningService
{
    private readonly IMinioClient _minioClient;
    private readonly ILogger<MinioProvisioningService> _logger;

    public MinioProvisioningService(
        IOptions<MinIOSettings> settings,
        ILogger<MinioProvisioningService> logger)
    {
        _logger = logger;

        var cfg = settings.Value;
        var builder = new MinioClient()
            .WithEndpoint(cfg.Endpoint)
            .WithCredentials(cfg.AccessKey, cfg.SecretKey);

        if (cfg.UseSSL)
            builder = builder.WithSSL();

        _minioClient = builder.Build();

        _logger.LogInformation("MinIO client initialized with endpoint {Endpoint}", cfg.Endpoint);
    }

    public async Task<bool> CreateBucketAsync(string bucketName, string region, CancellationToken cancellationToken = default)
    {
        try
        {
            // 1. Validate bucket name (S3 naming rules)
            ValidateBucketName(bucketName);

            // 2. Idempotency: check if bucket already exists
            bool exists = await _minioClient.BucketExistsAsync(
                new BucketExistsArgs().WithBucket(bucketName), cancellationToken);

            if (exists)
            {
                _logger.LogInformation("Bucket '{BucketName}' already exists (idempotent). Skipping creation.", bucketName);
                return true;
            }

            // 3. Create bucket
            _logger.LogInformation("Creating bucket '{BucketName}' in region '{Region}'...", bucketName, region);

            var makeArgs = new MakeBucketArgs()
                .WithBucket(bucketName);

            if (!string.IsNullOrEmpty(region) && region != "default")
                makeArgs = makeArgs.WithLocation(region);

            await _minioClient.MakeBucketAsync(makeArgs, cancellationToken);

            _logger.LogInformation("Bucket '{BucketName}' created successfully.", bucketName);
            return true;
        }
        catch (BadRequestException)
        {
            throw; // Re-throw business exceptions
        }
        catch (ConflictException)
        {
            throw;
        }
        catch (Minio.Exceptions.MinioException ex) when (ex.Message.Contains("BucketAlreadyOwnedByYou", StringComparison.OrdinalIgnoreCase)
                                                         || ex.Message.Contains("BucketAlreadyExists", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogInformation("Bucket '{BucketName}' already exists (concurrent creation). Returning success.", bucketName);
            return true;
        }
        catch (Minio.Exceptions.MinioException ex) when (ex.Message.Contains("InvalidBucketName", StringComparison.OrdinalIgnoreCase))
        {
            throw new BadRequestException(
                $"Tên bucket '{bucketName}' không hợp lệ. " +
                "Tên bucket phải từ 3-63 ký tự, chỉ dùng chữ thường, số và dấu gạch ngang, " +
                "không bắt đầu hoặc kết thúc bằng dấu gạch ngang.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create bucket '{BucketName}'", bucketName);
            return false;
        }
    }

    /// <summary>
    /// Validates bucket name against S3 naming rules.
    /// </summary>
    private static void ValidateBucketName(string bucketName)
    {
        if (string.IsNullOrWhiteSpace(bucketName))
            throw new BadRequestException("Tên bucket không được để trống.");

        if (bucketName.Length < 3 || bucketName.Length > 63)
            throw new BadRequestException(
                $"Tên bucket '{bucketName}' phải từ 3-63 ký tự (hiện {bucketName.Length} ký tự).");

        if (!Regex.IsMatch(bucketName, @"^[a-z0-9][a-z0-9\-]*[a-z0-9]$"))
        {
            // Generate suggestion
            var suggested = Regex.Replace(bucketName.ToLowerInvariant(), @"[^a-z0-9\-]", "-")
                .Trim('-');
            if (suggested.Length < 3) suggested = $"bucket-{suggested}-{Guid.NewGuid().ToString("N")[..4]}";

            throw new BadRequestException(
                $"Tên bucket '{bucketName}' không hợp lệ. " +
                "Chỉ dùng chữ thường, số và dấu gạch ngang. " +
                $"Gợi ý: '{suggested}'");
        }
    }
}
