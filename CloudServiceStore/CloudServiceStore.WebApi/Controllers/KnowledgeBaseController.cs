using CloudServiceStore.Application.Features.KnowledgeBase.Commands.Create;
using CloudServiceStore.Application.Features.KnowledgeBase.Commands.Delete;
using CloudServiceStore.Application.Features.KnowledgeBase.Commands.IncrementViewCount;
using CloudServiceStore.Application.Features.KnowledgeBase.Commands.Update;
using CloudServiceStore.Application.Features.KnowledgeBase.Queries.GetAll;
using CloudServiceStore.Application.Features.KnowledgeBase.Queries.GetById;
using CloudServiceStore.Application.Features.KnowledgeBase.Queries.GetPublishedKbArticles;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/knowledge-base")]
[Route("api/knowledgebase")]
public class KnowledgeBaseController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IRepository<KnowledgeBaseArticle> _kbRepo;
    private readonly IRepository<AppUser> _userRepo;
    private readonly IUnitOfWork _uow;

    public KnowledgeBaseController(
        IMediator mediator,
        IRepository<KnowledgeBaseArticle> kbRepo,
        IRepository<AppUser> userRepo,
        IUnitOfWork uow)
    {
        _mediator = mediator;
        _kbRepo = kbRepo;
        _userRepo = userRepo;
        _uow = uow;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublished(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetPublishedKbArticlesQuery(), ct);
        return Ok(result);
    }

    [HttpGet("all")]
    [Authorize(Roles = "Admin,Editor,Support,Staff,Technician,Accountant")]
    public async Task<IActionResult> GetAllArticles(CancellationToken ct)
    {
        var articles = await _kbRepo.GetAllAsync(ct);
        return Ok(articles.OrderByDescending(a => a.ViewCount));
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(string id, CancellationToken ct)
    {
        if (Guid.TryParse(id, out var guidId))
        {
            var result = await _mediator.Send(new GetKbArticleByIdQuery(guidId), ct);
            if (result != null)
                return Ok(result);
        }

        var articleBySlug = await _kbRepo.FirstOrDefaultAsync(a => a.Slug == id, ct);
        if (articleBySlug != null)
            return Ok(articleBySlug);

        return NotFound();
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Editor,Support,Staff,Technician,Accountant")]
    public async Task<IActionResult> Create([FromBody] CreateKbArticleCommand command, CancellationToken ct)
    {
        if (command.AuthorId == Guid.Empty)
        {
            var users = await _userRepo.GetAllAsync(ct);
            var defaultAuthor = users.FirstOrDefault(u => u.Role?.Name == "Admin") ?? users.FirstOrDefault();
            var authorId = defaultAuthor?.Id ?? Guid.NewGuid();
            command = command with { AuthorId = authorId };
        }
        var id = await _mediator.Send(command, ct);
        return Ok(new { Id = id });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Editor,Support,Staff,Technician,Accountant")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateKbArticleCommand command, CancellationToken ct)
    {
        if (id != command.Id)
            return BadRequest("Id in route does not match Id in command");

        var result = await _mediator.Send(command, ct);
        if (!result)
            return NotFound();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Editor,Support,Staff,Technician,Accountant")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new DeleteKbArticleCommand(id), ct);
        if (!result)
            return NotFound();

        return NoContent();
    }

    [HttpPatch("{id}/view")]
    [AllowAnonymous]
    public async Task<IActionResult> IncrementViewCount(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new IncrementKbArticleViewCountCommand(id), ct);
        if (!result)
            return NotFound();

        return NoContent();
    }

    [HttpPost("upload")]
    [Authorize(Roles = "Admin,Editor,Support,Staff,Technician,Accountant")]
    public async Task<IActionResult> UploadAttachment(IFormFile file, [FromServices] IWebHostEnvironment env, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Không tìm thấy file tải lên." });

        if (file.Length > 20 * 1024 * 1024)
            return BadRequest(new { message = "Kích thước file không được vượt quá 20MB." });

        var uploadsFolder = Path.Combine(env.WebRootPath ?? env.ContentRootPath, "images", "kb");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var safeFileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsFolder, safeFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream, ct);
        }

        var fileUrl = $"/images/kb/{safeFileName}";
        return Ok(new { 
            url = fileUrl, 
            fileName = file.FileName,
            fileSize = file.Length,
            isImage = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg" }.Contains(ext)
        });
    }

    [HttpPost("seed")]
    [AllowAnonymous]
    public async Task<IActionResult> SeedDefaultArticles(CancellationToken ct)
    {
        var existing = await _kbRepo.GetAllAsync(ct);
        var users = await _userRepo.GetAllAsync(ct);
        var defaultAuthor = users.FirstOrDefault(u => u.Role?.Name == "Admin") ?? users.FirstOrDefault();
        var authorId = defaultAuthor?.Id ?? Guid.NewGuid();

        var seedList = new List<KnowledgeBaseArticle>
        {
            new KnowledgeBaseArticle(
                "Hướng Dẫn Kết Nối SSH & Bảo Mật VPS Ubuntu 24.04 LTS Cơ Bản",
                "huong-dan-ssh-bao-mat-vps-ubuntu-24",
                "<h3>1. Kết Nối Máy Chủ Lần Đầu Qua SSH</h3><p>Sau khi khởi tạo Cloud VPS tại SEN CloudHost, bạn sẽ nhận được thông tin địa chỉ IPv4 và mật khẩu root qua email. Mở Terminal (trên macOS/Linux) hoặc PowerShell (trên Windows) và chạy lệnh sau:</p><pre><code>ssh root@103.178.234.12</code></pre><h3>2. Cập Nhật Hệ Thống Gói Package</h3><p>Trước khi cài đặt bất kỳ phần mềm nào, hãy luôn đồng bộ và nâng cấp danh sách kho ứng dụng:</p><pre><code>sudo apt update && sudo apt upgrade -y</code></pre><h3>3. Tạo Tài Khoản Người Dùng Mới Với Quyền Sudo</h3><p>Nhằm đảm bảo an toàn tuyệt đối, không nên sử dụng tài khoản root trực tiếp để chạy các dịch vụ web:</p><pre><code>adduser deployer\nusermod -aG sudo deployer</code></pre><h3>4. Kích Hoạt Tường Lửa UFW Firewall</h3><p>Chỉ cho phép các cổng kết nối cần thiết hoạt động:</p><pre><code>sudo ufw allow OpenSSH\nsudo ufw allow 80/tcp\nsudo ufw allow 443/tcp\nsudo ufw enable</code></pre>",
                "Máy Chủ & Cloud VPS",
                authorId,
                true
            ),
            new KnowledgeBaseArticle(
                "Cài Đặt & Cấu Hình Web Server Nginx + Certbot SSL Let's Encrypt Miễn Phí",
                "cai-dat-nginx-certbot-ssl-lets-encrypt",
                "<h3>1. Cài Đặt Nginx Web Server</h3><p>Nginx là web server hiệu năng cao được tối ưu hóa cho tốc độ xử lý hàng nghìn kết nối đồng thời:</p><pre><code>sudo apt install nginx -y\nsudo systemctl start nginx\nsudo systemctl enable nginx</code></pre><h3>2. Cài Đặt Certbot & Cấp Chứng Chỉ SSL Let's Encrypt</h3><p>Certbot tự động tạo và gia hạn chứng chỉ HTTPS hoàn toàn miễn phí:</p><pre><code>sudo apt install certbot python3-certbot-nginx -y\nsudo certbot --nginx -d yourdomain.com -d www.yourdomain.com</code></pre><h3>3. Kiểm Tra Cấu Hình Nginx</h3><pre><code>sudo nginx -t\nsudo systemctl reload nginx</code></pre>",
                "Web Server & Nginx",
                authorId,
                true
            ),
            new KnowledgeBaseArticle(
                "Triển Khai Cụm Docker Compose: Nginx Reverse Proxy + PostgreSQL + Redis",
                "trien-khai-docker-compose-nginx-postgresql-redis",
                "<h3>1. Cài Đặt Docker Engine & Docker Compose Plugin</h3><pre><code>curl -fsSL https://get.docker.com -o get-docker.sh\nsudo sh get-docker.sh\nsudo apt install docker-compose-plugin -y</code></pre><h3>2. Mẫu File docker-compose.yml Chuẩn Production</h3><pre><code>version: '3.8'\nservices:\n  db:\n    image: postgres:16-alpine\n    restart: always\n    environment:\n      POSTGRES_DB: appdb\n      POSTGRES_USER: postgres\n      POSTGRES_PASSWORD: SecretPassword123\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n  redis:\n    image: redis:7-alpine\n    restart: always\nvolumes:\n  pgdata:</code></pre>",
                "Container & Docker",
                authorId,
                true
            ),
            new KnowledgeBaseArticle(
                "Hướng Dẫn Tối Ưu Hóa Hiệu Năng MySQL / MariaDB Cho Web Tải Lớn",
                "toi-uu-hoa-hieu-nang-mysql-mariadb",
                "<h3>1. Cấu Hình Bộ Nhớ Đệm InnoDB Buffer Pool</h3><p>Mở file cấu hình <code>/etc/mysql/my.cnf</code> hoặc <code>/etc/mysql/mysql.conf.d/mysqld.cnf</code>:</p><pre><code>[mysqld]\ninnodb_buffer_pool_size = 4G\ninnodb_log_file_size = 512M\nmax_connections = 500\ninnodb_flush_log_at_trx_commit = 2</code></pre><h3>2. Khởi Động Lại MySQL Service</h3><pre><code>sudo systemctl restart mysql</code></pre>",
                "Cơ Sở Dữ Liệu",
                authorId,
                true
            ),
            new KnowledgeBaseArticle(
                "Thiết Lập Tường Lửa UFW & Chống Tấn Công DDoS Layer 4/7",
                "thiet-lap-tuong-lua-ufw-anti-ddos",
                "<h3>1. Giới Hạn Tần Suất Kết Nối (Rate Limit) Chống Bruteforce SSH</h3><pre><code>sudo ufw limit ssh/tcp</code></pre><h3>2. Cài Đặt Fail2ban Tự Động Khóa IP Tấn Công</h3><pre><code>sudo apt install fail2ban -y\nsudo systemctl enable --now fail2ban</code></pre>",
                "Bảo Mật & SSL/WAF",
                authorId,
                true
            ),
            new KnowledgeBaseArticle(
                "Hướng Dẫn Cấu Hình DNS Tên Miền Về Cloud VPS SEN CloudHost",
                "huong-dan-cau-hinh-dns-ten-mien-ve-vps",
                "<h3>1. Cấu Hình Bản Ghi A Record</h3><p>Tạo bản ghi A trỏ tên miền chính về IP máy chủ VPS của bạn:</p><pre><code>Host: @\nType: A\nValue: 103.178.234.12\nTTL: 300 (5 phút)</code></pre><h3>2. Cấu Hình Bản Ghi CNAME Cho Phụ</h3><pre><code>Host: www\nType: CNAME\nValue: yourdomain.com</code></pre>",
                "Tên Miền & DNS",
                authorId,
                true
            )
        };

        int addedCount = 0;
        foreach (var art in seedList)
        {
            if (!existing.Any(e => e.Slug == art.Slug))
            {
                await _kbRepo.AddAsync(art, ct);
                addedCount++;
            }
        }

        if (addedCount > 0)
        {
            await _uow.SaveChangesAsync(ct);
        }

        return Ok(new { message = $"Đã tiêm {addedCount} bài viết chuẩn vào cơ sở dữ liệu thành công!", count = addedCount });
    }
}
