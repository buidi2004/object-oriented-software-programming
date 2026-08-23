using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public enum JobApplicationStatus
{
    Submitted = 1,     // Bước 1: Đã tiếp nhận hồ sơ
    Reviewing = 2,     // Bước 2: Đang xem xét & thẩm định CV
    Interviewing = 3,  // Bước 3: Lên lịch phỏng vấn & test chuyên môn
    Accepted = 4,      // Bước 4: Trúng tuyển / Gửi Thư Mời Nhận Việc (Offer)
    Rejected = 5       // Bước 4 (Phương án 2): Chưa phù hợp đợt tuyển này
}

public class JobApplication : AggregateRoot
{
    public string ApplicationCode { get; set; } = string.Empty; // Mã hồ sơ tra cứu (vd: APP-8921)
    public string CandidateName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string JobPosition { get; set; } = string.Empty; // Vị trí ứng tuyển
    public string ExpectedSalary { get; set; } = string.Empty; // Mức lương mong muốn
    public string ExperienceLevel { get; set; } = string.Empty; // Số năm kinh nghiệm
    public string PortfolioUrl { get; set; } = string.Empty; // GitHub / LinkedIn / Portfolio
    public string Introduction { get; set; } = string.Empty; // Giới thiệu bản thân
    public string CvFileUrl { get; set; } = string.Empty; // Link file PDF/Docx
    public string CvFileName { get; set; } = string.Empty; // Tên file gốc
    public long CvFileSize { get; set; } // Dung lượng byte
    public JobApplicationStatus Status { get; set; } = JobApplicationStatus.Submitted;
    public string AdminNotes { get; set; } = string.Empty; // Ghi chú của HR/Admin
    public string InterviewSchedule { get; set; } = string.Empty; // Lịch phỏng vấn (nếu có)
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
