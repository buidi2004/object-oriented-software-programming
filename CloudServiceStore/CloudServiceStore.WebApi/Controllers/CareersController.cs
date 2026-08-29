using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/careers")]
public class CareersController : ControllerBase
{
    private readonly IRepository<JobApplication> _jobAppRepo;
    private readonly IUnitOfWork _uow;
    private readonly IEmailService _emailService;
    private readonly IWebHostEnvironment _env;
    private readonly AppDbContext _dbContext;
    private static bool _tableEnsured = false;

    public CareersController(
        IRepository<JobApplication> jobAppRepo,
        IUnitOfWork uow,
        IEmailService emailService,
        IWebHostEnvironment env,
        AppDbContext dbContext)
    {
        _jobAppRepo = jobAppRepo;
        _uow = uow;
        _emailService = emailService;
        _env = env;
        _dbContext = dbContext;
    }

    private async Task EnsureTableCreatedAsync(CancellationToken ct)
    {
        if (_tableEnsured) return;
        try
        {
            await _dbContext.Database.ExecuteSqlRawAsync(@"
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'JobApplications')
                BEGIN
                    CREATE TABLE JobApplications (
                        Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
                        ApplicationCode NVARCHAR(50) NOT NULL,
                        CandidateName NVARCHAR(255) NOT NULL,
                        Email NVARCHAR(255) NOT NULL,
                        PhoneNumber NVARCHAR(50) NOT NULL,
                        JobPosition NVARCHAR(255) NOT NULL,
                        ExpectedSalary NVARCHAR(100) NOT NULL,
                        ExperienceLevel NVARCHAR(100) NOT NULL,
                        PortfolioUrl NVARCHAR(500) NOT NULL,
                        Introduction NVARCHAR(MAX) NOT NULL,
                        CvFileUrl NVARCHAR(500) NOT NULL,
                        CvFileName NVARCHAR(255) NOT NULL,
                        CvFileSize BIGINT NOT NULL,
                        Status INT NOT NULL,
                        AdminNotes NVARCHAR(MAX) NOT NULL,
                        InterviewSchedule NVARCHAR(500) NOT NULL,
                        CreatedAt DATETIME2 NOT NULL,
                        UpdatedAt DATETIME2 NOT NULL
                    );
                END", ct);
            _tableEnsured = true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"EnsureTableCreated Exception: {ex.Message}");
        }
    }

    public class ApplyJobDto
    {
        public string CandidateName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string JobPosition { get; set; } = string.Empty;
        public string ExpectedSalary { get; set; } = string.Empty;
        public string ExperienceLevel { get; set; } = string.Empty;
        public string PortfolioUrl { get; set; } = string.Empty;
        public string Introduction { get; set; } = string.Empty;
        public IFormFile? CvFile { get; set; }
    }

    public class UpdateJobStatusDto
    {
        public JobApplicationStatus Status { get; set; }
        public string? AdminNotes { get; set; }
        public string? InterviewSchedule { get; set; }
        public bool SendEmail { get; set; } = true;
        public string? CustomEmailSubject { get; set; }
        public string? CustomEmailBody { get; set; }
    }

    [HttpPost("apply")]
    [AllowAnonymous]
    public async Task<IActionResult> Apply([FromForm] ApplyJobDto dto, CancellationToken ct)
    {
        await EnsureTableCreatedAsync(ct);
        if (string.IsNullOrWhiteSpace(dto.CandidateName) || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.JobPosition))
        {
            return BadRequest(new { message = "Vui lòng cung cấp đầy đủ Họ tên, Email và Vị trí ứng tuyển." });
        }

        var randomCode = $"APP-{new Random().Next(1000, 9999)}";
        string cvUrl = string.Empty;
        string cvName = string.Empty;
        long cvSize = 0;

        if (dto.CvFile != null && dto.CvFile.Length > 0)
        {
            if (dto.CvFile.Length > 25 * 1024 * 1024)
                return BadRequest(new { message = "File CV không được vượt quá 25MB." });

            var uploadsFolder = Path.Combine(_env.ContentRootPath, "uploads", "cvs");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var ext = Path.GetExtension(dto.CvFile.FileName).ToLowerInvariant();
            var safeFileName = $"{Guid.NewGuid()}_{Path.GetFileNameWithoutExtension(dto.CvFile.FileName).Replace(" ", "_")}{ext}";
            var filePath = Path.Combine(uploadsFolder, safeFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.CvFile.CopyToAsync(stream, ct);
            }

            cvUrl = $"/uploads/cvs/{safeFileName}";
            cvName = dto.CvFile.FileName;
            cvSize = dto.CvFile.Length;
        }

        var application = new JobApplication
        {
            ApplicationCode = randomCode,
            CandidateName = dto.CandidateName.Trim(),
            Email = dto.Email.Trim(),
            PhoneNumber = dto.PhoneNumber?.Trim() ?? string.Empty,
            JobPosition = dto.JobPosition.Trim(),
            ExpectedSalary = dto.ExpectedSalary?.Trim() ?? string.Empty,
            ExperienceLevel = dto.ExperienceLevel?.Trim() ?? string.Empty,
            PortfolioUrl = dto.PortfolioUrl?.Trim() ?? string.Empty,
            Introduction = dto.Introduction?.Trim() ?? string.Empty,
            CvFileUrl = cvUrl,
            CvFileName = cvName,
            CvFileSize = cvSize,
            Status = JobApplicationStatus.Submitted,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _jobAppRepo.AddAsync(application, ct);
        // Send confirmation email to candidate
        try
        {
            var candidateEmailBody = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff;'>
                    <div style='background: #0f172a; padding: 24px; text-align: center; color: white;'>
                        <img src='https://object-oriented-software-programmin-sable.vercel.app/images/logo.png' alt='CloudHost VN Logo' style='height: 50px; margin-bottom: 10px;' />
                        <h2 style='margin: 0; font-size: 20px; font-weight: 800;'>SEN CloudHost VN</h2>
                        <p style='margin: 4px 0 0 0; font-size: 11px; color: #94a3b8;'>THÔNG BÁO TIẾP NHẬN HỒ SƠ TUYỂN DỤNG</p>
                    </div>
                    <div style='padding: 28px;'>
                        <h3 style='color: #0f172a; margin-top: 0;'>Chào bạn {dto.CandidateName},</h3>
                        <p style='color: #475569; font-size: 14px; line-height: 1.6;'>
                            Cảm ơn bạn đã ứng tuyển gia nhập đội ngũ <strong>SEN CloudHost</strong>. Hệ thống đã tiếp nhận hồ sơ và kích hoạt tiến trình 4 bước thẩm định.
                        </p>
                        <div style='background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; margin: 20px 0;'>
                            <p style='margin: 4px 0; font-size: 13px;'><strong>Vị trí ứng tuyển:</strong> {dto.JobPosition}</p>
                            <p style='margin: 4px 0; font-size: 13px;'><strong>Mã tra cứu hồ sơ:</strong> <span style='background: #0f172a; color: #ffffff; padding: 3px 10px; border-radius: 6px; font-weight: bold; font-family: monospace;'>{randomCode}</span></p>
                            <p style='margin: 4px 0; font-size: 13px;'><strong>Trạng thái:</strong> <span style='color: #0f172a; font-weight: bold;'>Bước 1/4 - Đã Tiếp Nhận CV</span></p>
                        </div>
                        <div style='text-align: center; margin: 24px 0;'>
                            <a href='https://object-oriented-software-programmin-sable.vercel.app/careers' 
                               style='background: #0f172a; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 13px; display: inline-block;'>
                                🔍 Tra Cứu Tiến Trình 4 Bước Tại Website
                            </a>
                        </div>
                        <p style='color: #64748b; font-size: 12px; line-height: 1.6;'>
                            Ban Tuyển dụng &amp; Trưởng bộ phận sẽ liên hệ trực tiếp với bạn trong vòng 1-3 ngày làm việc.
                        </p>
                    </div>
                    <div style='background: #f1f5f9; padding: 16px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0;'>
                        © SEN CloudHost VN &bull; Hotline: 1900 6868 &bull; Email: hr@cloudhost.vn
                    </div>
                </div>";

            await _emailService.SendEmailAsync(dto.Email, $"[SEN CloudHost] Tiếp nhận hồ sơ ứng tuyển vị trí {dto.JobPosition} ({randomCode})", candidateEmailBody, ct);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send confirmation email to candidate: {ex.Message}");
        }

        await _uow.SaveChangesAsync(ct);
        return Ok(new
        {
            success = true,
            id = application.Id,
            applicationCode = application.ApplicationCode,
            message = "Nộp hồ sơ ứng tuyển thành công! Mã hồ sơ của bạn là " + application.ApplicationCode
        });
    }

    [HttpGet("track/{codeOrEmail}")]
    [AllowAnonymous]
    public async Task<IActionResult> TrackApplication(string codeOrEmail, CancellationToken ct)
    {
        await EnsureTableCreatedAsync(ct);
        if (string.IsNullOrWhiteSpace(codeOrEmail))
            return BadRequest(new { message = "Vui lòng nhập mã hồ sơ hoặc email." });

        var term = codeOrEmail.Trim().ToLowerInvariant();
        var apps = await _jobAppRepo.GetAllAsync(ct);
        var filtered = apps
            .Where(a => a.ApplicationCode.ToLowerInvariant() == term || a.Email.ToLowerInvariant() == term)
            .OrderByDescending(a => a.CreatedAt)
            .ToList();

        return Ok(filtered);
    }

    [HttpGet]
    [HttpGet("admin")]
    [HttpGet("admin/all")]
    [Authorize(Roles = "Admin,Editor,HR,Support")]
    public async Task<IActionResult> GetAllAdmin(CancellationToken ct)
    {
        await EnsureTableCreatedAsync(ct);
        var apps = await _jobAppRepo.GetAllAsync(ct);
        return Ok(apps.OrderByDescending(a => a.CreatedAt));
    }

    [HttpGet("admin/{id}")]
    [Authorize(Roles = "Admin,Editor,Support,Staff,Technician,Accountant")]
    public async Task<IActionResult> GetByIdForAdmin(Guid id, CancellationToken ct)
    {
        var app = await _jobAppRepo.GetByIdAsync(id, ct);
        if (app == null) return NotFound();
        return Ok(app);
    }

    [HttpPut("admin/{id}/status")]
    [Authorize(Roles = "Admin,Editor,Support,Staff,Technician,Accountant")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateJobStatusDto dto, CancellationToken ct)
    {
        var app = await _jobAppRepo.GetByIdAsync(id, ct);
        if (app == null) return NotFound();

        app.Status = (JobApplicationStatus)dto.Status;
        if (!string.IsNullOrWhiteSpace(dto.InterviewSchedule))
            app.InterviewSchedule = dto.InterviewSchedule;
        if (!string.IsNullOrWhiteSpace(dto.AdminNotes))
            app.AdminNotes = dto.AdminNotes;
        app.UpdatedAt = DateTime.UtcNow;

        _jobAppRepo.Update(app);
        await _uow.SaveChangesAsync(ct);

        // Optional: send status email update to candidate
        if (dto.SendEmail && !string.IsNullOrWhiteSpace(app.Email))
        {
            try
            {
                var statusText = app.Status switch
                {
                    JobApplicationStatus.Reviewing => "🔍 Đang Thẩm Định Hồ Sơ Chuyên Môn (Bước 2/4)",
                    JobApplicationStatus.Interviewing => "📅 Mời Tham Gia Phỏng Vấn Kỹ Thuật (Bước 3/4)",
                    JobApplicationStatus.Accepted => "🎉 Chúc Mừng Bạn Đã Trúng Tuyển (Bước 4/4 - Offer)",
                    JobApplicationStatus.Rejected => "Hồ Sơ Chưa Phù Hợp Đợt Này (Lưu trữ Talent Pool)",
                    _ => "Đã Tiếp Nhận Hồ Sơ (Bước 1/4)"
                };

                var subject = $"[SEN CloudHost] Cập nhật trạng thái hồ sơ ứng tuyển ({app.ApplicationCode})";
                var fullHtml = $@"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff;'>
                        <div style='background: #0f172a; padding: 24px; text-align: center; color: white;'>
                            <img src='https://object-oriented-software-programmin-sable.vercel.app/images/logo.png' alt='CloudHost VN Logo' style='height: 50px; margin-bottom: 10px;' />
                            <h2 style='margin: 0; font-size: 20px; font-weight: 800;'>SEN CloudHost VN</h2>
                            <p style='margin: 4px 0 0 0; font-size: 11px; color: #94a3b8;'>CẬP NHẬT TIẾN TRÌNH TUYỂN DỤNG</p>
                        </div>
                        <div style='padding: 28px;'>
                            <p style='color: #0f172a; font-size: 15px;'>Xin chào <strong>{app.CandidateName}</strong>,</p>
                            <p style='color: #475569; font-size: 14px; line-height: 1.6;'>
                                Hồ sơ ứng tuyển vị trí <strong>{app.JobPosition}</strong> (Mã: <strong>{app.ApplicationCode}</strong>) của bạn vừa được cập nhật tiến độ mới:
                            </p>
                            <div style='background: #f8fafc; border: 1px solid #cbd5e1; padding: 18px; border-radius: 12px; margin: 18px 0;'>
                                <h3 style='margin: 0 0 8px 0; color: #0f172a; font-size: 16px;'>{statusText}</h3>
                                {(string.IsNullOrEmpty(app.InterviewSchedule) ? "" : $"<p style='margin: 6px 0; font-size: 13px; color: #0284c7;'><strong>Lịch phỏng vấn:</strong> {app.InterviewSchedule}</p>")}
                                {(string.IsNullOrEmpty(app.AdminNotes) ? "" : $"<p style='margin: 6px 0; font-size: 13px; color: #475569;'><strong>Ghi chú từ HR:</strong> {app.AdminNotes}</p>")}
                            </div>
                            <div style='text-align: center; margin: 24px 0;'>
                                <a href='https://object-oriented-software-programmin-sable.vercel.app/careers' 
                                   style='background: #0f172a; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 13px; display: inline-block;'>
                                    🔍 Xem Chi Tiết Trên Cổng Tuyển Dụng
                                </a>
                            </div>
                        </div>
                        <div style='background: #f1f5f9; padding: 16px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0;'>
                            © SEN CloudHost VN &bull; Hotline: 1900 6868 &bull; Email: hr@cloudhost.vn
                        </div>
                    </div>";

                await _emailService.SendEmailAsync(app.Email, subject, fullHtml, ct);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send status update email: {ex.Message}");
            }
        }

        return Ok(new { success = true, status = app.Status, message = "Đã cập nhật trạng thái hồ sơ thành công!" });
    }

    [HttpDelete("admin/{id}")]
    [Authorize(Roles = "Admin,Editor,Support,Staff,Technician,Accountant")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var app = await _jobAppRepo.GetByIdAsync(id, ct);
        if (app == null) return NotFound();

        _jobAppRepo.Delete(app);
        await _uow.SaveChangesAsync(ct);

        return NoContent();
    }

    [HttpGet("download-cv/{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> DownloadCv(Guid id, CancellationToken ct)
    {
        var app = await _jobAppRepo.GetByIdAsync(id, ct);
        if (app == null || string.IsNullOrEmpty(app.CvFileUrl))
            return NotFound(new { message = "Không tìm thấy file CV." });

        var fileName = Path.GetFileName(app.CvFileUrl);
        var filePath = Path.Combine(_env.ContentRootPath, "uploads", "cvs", fileName);
        if (!System.IO.File.Exists(filePath))
            return NotFound(new { message = "File CV không tồn tại trên hệ thống lưu trữ." });

        var ext = Path.GetExtension(filePath).ToLowerInvariant();
        var contentType = ext switch
        {
            ".pdf" => "application/pdf",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".doc" => "application/msword",
            ".zip" => "application/zip",
            _ => "application/octet-stream"
        };

        var downloadName = string.IsNullOrEmpty(app.CvFileName) ? fileName : app.CvFileName;
        return PhysicalFile(filePath, contentType, downloadName, enableRangeProcessing: true);
    }
}
