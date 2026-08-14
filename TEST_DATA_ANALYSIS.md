# PHÂN TÍCH DỮ LIỆU TEST TRONG BACKEND - CLOUDSERVICESTORE

## 1. TỔNG QUAN CHIẾN LƯỢC TEST DATA

Dự án áp dụng **chiến lược hybrid**: kết hợp cả dữ liệu thật (real) và dữ liệu giả (mock), mỗi loại phục vụ mục đích testing khác nhau.

### Phân bố Test Data theo Layer

| Layer Test | Loại Data | Công cụ | Mục đích | Số lượng test |
|------------|-----------|---------|----------|---------------|
| **Unit Tests** | Mock dữ liệu | Moq | Kiểm tra logic nghiệp vụ riêng lẻ | ~150 tests |
| **Integration Tests** | Dữ liệu thật trong DB container | Testcontainers + SQL Server | Kiểm tra tương tác DB-thật | ~50 tests |
| **E2E Tests** | Dữ liệu thật qua API | Real HTTP requests | Kiểm tra luồng nghiệp vụ toàn bộ | ~30 tests |
| **Infrastructure Tests** | Dữ liệu thật tĩnh | Constants/Values | Kiểm tra utility, key generation | ~20 tests |

---

## 2. UNIT TESTS - MOCK DATA (100% GIẢ)

### Đặc điểm:
- **Không kết nối database**
- **Mock semua dependencies** bằng Moq
- **Test isolate handler** - chỉ kiểm tra business logic

### Ví dụ: AddToCartCommandHandlerTests.cs

```csharp
public class AddToCartCommandHandlerTests
{
    // Mock toàn bộ dependencies
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<IRepository<Cart>> _cartRepoMock = new(MockBehavior.Strict);
    private readonly Mock<IRepository<ServicePlan>> _planRepoMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();

    [Fact]
    public async Task Handle_UserNotLoggedIn_ThrowsUnauthorizedException()
    {
        // ARRANGE - Setup mock data
        _currentUserMock.Setup(x => x.UserId).Returns((Guid?)null);
        
        // ACT & ASSERT
        await Assert.ThrowsAsync<UnauthorizedException>(
            () => CreateHandler().Handle(new AddToCartCommand(...), CancellationToken.None));
    }
}
```

### Loại data sử dụng:
| Component | Data Type | Source |
|-----------|-----------|--------|
| User IDs | `Guid.NewGuid()` | Random generated |
| Service Plans | POCO objects | In-memory creation |
| Cart items | POCO objects | In-memory creation |
| Repository returns | `.ReturnsAsync(mockObject)` | Moq setup |

### Ưu điểm:
✅ Fast execution (không cần start DB)
✅ Deterministic results
✅ Easy to understand isolation

### Nhược điểm:
❌ Không test được database interactions
❌ Không detect được mapping errors
❌ False positive risk cao

---

## 3. INTEGRATION TESTS - REAL DATABASE (80% THẬT)

### Đặc điểm:
- **Testcontainers** tạo SQL Server container thật
- **WebApplicationFactory** khởi tạo đầy đủ DI
- **Dữ liệu seeding** từ domain entities thật

### Ví dụ: BaseIntegrationTest.cs

```csharp
public abstract class BaseIntegrationTest : IAsyncLifetime
{
    protected readonly CustomWebApplicationFactory Factory;
    protected readonly HttpClient Client;

    // Setup DB thật
    protected async Task SeedUserAsync(Guid userId)
    {
        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        var user = new AppUser("Test User", $"test_{userId}@test.com", "hash", role.Id)
        {
            Id = userId
        };
        db.AppUsers.Add(user);
        await db.SaveChangesAsync(); // Save vào DB thật
    }

    public async Task InitializeAsync()
    {
        await Factory.ResetDatabaseAsync(); // Reset DB trước mỗi test
    }
}
```

### Ví dụ: CartIntegrationTests.cs

```csharp
[Fact]
public async Task AddToCart_And_GetMyCart_ShouldSucceed()
{
    AuthenticateCustomer(); // JWT mock
    
    // 1. Arrange - Tạo entity thật
    var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    await SeedUserAsync(userId);
    
    var planId = Guid.NewGuid();
    await AddEntityAsync(new ServicePlan(categoryId, "Test Plan", ...));
    await AddEntityAsync(new PlanPrice { 
        ServicePlanId = planId, 
        BillingCycle = BillingCycle.Monthly, 
        Price = 100000 
    });
    
    // 2. Act - Gọi API thật
    var response = await Client.PostAsJsonAsync("/api/carts/items", command);
    
    // 3. Assert - Đọc từ DB thật
    var cartContent = await getCartResponse.Content.ReadAsStringAsync();
    cartContent.Should().NotBeNullOrEmpty();
}
```

### Loại data sử dụng:
| Component | Data Type | Storage |
|-----------|-----------|---------|
| Users | Entity objects | SQL Server (TestContainer) |
| Service Plans | Entity objects | SQL Server |
| JWT Tokens | Mock strings | In-memory validation |
| API Responses | HTTP responses | Live server |

### Ưu điểm:
✅ Test được EF Core mappings
✅ Test được transaction boundaries
✅ Phát hiện được database schema issues

### Nhược điểm:
❌ Chậm hơn unit tests (phải start container)
❌ Cần Docker running
❌ Harder to debug khi failure

---

## 4. E2E TESTS - FULL STACK REAL DATA (90% THẬT)

### Đặc điểm:
- **Http requests thật** qua REST API
- **JWT authentication thật** (register → login flow)
- **Database thật** với testcontainers
- **Luồng nghiệp vụ hoàn chỉnh**

### Ví dụ: CustomerJourneyE2ETests.cs

```csharp
[Fact]
public async Task CompleteCustomerJourney_ShouldSucceed()
{
    // 1. Setup Data - Tạo entity thật trong DB
    var category = new ServiceCategory { Id = Guid.NewGuid(), Name = "Cloud Server" };
    await AddEntityAsync(category);
    
    var plan = new ServicePlan(category.Id, "VPS Basic", ...);
    await AddEntityAsync(plan);
    
    var coupon = new Coupon("DISCOUNT10", 10m, 100, ...);
    await AddEntityAsync(coupon);
    
    // 2. Auth flow thật
    var token = await RegisterAndLoginCustomerAsync("customer@test.com", "Password123!");
    
    // 3. Full business flow qua API
    var topUpResponse = await Client.PostAsJsonAsync("/api/wallet/top-up", new { amount = 500 });
    var addToCartResponse = await Client.PostAsJsonAsync("/api/carts/items", command);
    var checkoutResponse = await Client.PostAsJsonAsync("/api/orders/checkout", command);
    
    // 4. Assert responses
    checkoutResult.OrderId.Should().NotBeEmpty();
}
```

### Ví dụ: AuthFlow với JWT thật

```csharp
protected async Task<string> RegisterAndLoginCustomerAsync(string email, string password)
{
    // Register thật
    var registerCommand = new RegisterCommand("Test User", email, password, "0123456789");
    var registerResponse = await Client.PostAsJsonAsync("/api/auth/register", registerCommand);
    
    // Login thật
    var loginCommand = new LoginCommand(email, password, "127.0.0.1", "Test Browser", "Test Device");
    var loginResponse = await Client.PostAsJsonAsync("/api/auth/login", loginCommand);
    
    var authResult = await loginResponse.Content.ReadFromJsonAsync<AuthResultDto>();
    Client.DefaultRequestHeaders.Authorization = 
        new AuthenticationHeaderValue("Bearer", authResult.AccessToken);
    
    return authResult.AccessToken;
}
```

### Ưu điểm:
✅ Test được full pipeline từ controller đến database
✅ Test được authentication/authorization thật
✅ Phát hiện được integration issues giữa các层

---

## 5. INFRASTRUCTURE TESTS - STATIC DATA (100% CONSTANTS)

### Đặc điểm:
- **Kiểm tra utilities, constants**
- **Không cần mock hay DB**
- **Deterministic outputs**

### Ví dụ: CatalogCacheKeysTests.cs

```csharp
[Fact]
public void Categories_ShouldBeCorrectValue()
{
    // Test static constant
    CatalogCacheKeys.Categories.Should().Be("catalog:categories:v1");
}

[Fact]
public void CategoryPlans_ShouldNormalizeSlugToLowerInvariant()
{
    var key = CatalogCacheKeys.CategoryPlans("Cloud-VPS", "VND");
    key.Should().Be("catalog:cat-plans:cloud-vps:VND:v1");
}

[Fact]
public void ServicePlan_ShouldFormatGuidWithoutDashes()
{
    var planId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    var key = CatalogCacheKeys.ServicePlan(planId, "VND");
    key.Should().Be("catalog:plan:11111111111111111111111111111111:VND:v1");
}
```

### Ưu điểm:
✅ Extremely fast
✅ Zero dependencies
✅ Perfect for validating utility methods

---

## 6. SO SÁNH CHI TIẾT

| Aspect | Unit Tests (Mock) | Integration Tests (Real DB) | E2E Tests (Full Stack) |
|--------|-------------------|----------------------------|------------------------|
| **Data Source** | Moq mocks | Testcontainers SQL Server | Testcontainers + HTTP API |
| **DB Connection** | ❌ Không | ✅ Có | ✅ Có |
| **API Calls** | ❌ Không | ✅ Có (qua HttpClient) | ✅ Có |
| **Auth Flow** | ❌ Mock tokens | ⚠️ Partial (mock header) | ✅ Full (register → login) |
| **Execution Speed** | ⚡ Fastest (~ms) | 🐢 Medium (~s) | 🐢🐢 Slowest (~10s) |
| **Maintenance** | Dễ | Trung bình | Khó |
| **Coverage Focus** | Business logic | DB interactions | User journeys |
| **Failure Types Caught** | Logic errors | Mapping/SQL errors | Integration bugs |

---

## 7. Chi tiết từng nhóm test

### 7.1 Application Feature Tests (~150 tests)
- **Auth**: LoginCommandHandlerTests, RefreshTokenCommandHandlerTests
- **Carts**: AddToCart, UpdateCartItem, RemoveFromCart, GetMyCart
- **Orders**: CheckoutCommandHandlerTests
- **Coupons**: ApplyCouponCommandHandlerTests
- **Payments**: WebhookIdempotencyTests
- **Reviews**: CreateReviewCommandHandlerTests
- **Tickets**: CreateTicketCommandHandlerTests

**Data pattern**: Tất cả đều dùng Moq, test handler isolation

### 7.2 Integration Tests (~50 tests)
- **BaseIntegrationTest**: Dùng CustomWebApplicationFactory
- **DB Strategy**: MsSqlContainer + EnsureCreated()
- **Auth**: Mock JWT tokens qua TestAuthHandler
- **Seed data**: Thêm entities vào DB thật trước khi test

**Data pattern**: Entities được tạo từ constructors, lưu vào DB thật

### 7.3 E2E Tests (~30 tests)
- **BaseE2ETest**: Dùng E2EWebApplicationFactory
- **Auth**: Full register → login flow, lưu access token
- **Scenarios**: CustomerJourney, PaymentWebhook, AdminOperations
- **Data**: Tạo entities thật, chạy qua API thật

**Data pattern**: Real entities + real HTTP requests + real DB queries

### 7.4 Infrastructure Tests (~20 tests)
- **CatalogCacheKeysTests**: Static value validations
- **VpsSpecParserTests**: Input parsing validations

**Data pattern**: Pure constants and inputs, no external dependencies

---

## 8. KẾT LUẬN & ĐÁNH GIÁ

### Tổng quan:
```
┌─────────────────────────────────────────────────────┐
│              TEST DATA DISTRIBUTION                  │
├─────────────────────────────────────────────────────┤
│  Unit Tests       ████████████████████  ~65% Mock   │
│  Integration      ████████              ~25% Real   │
│  E2E Tests        ███                   ~8%  Full   │
│  Infrastructure   ██                    ~2% Const   │
└─────────────────────────────────────────────────────┘
```

### Điểm mạnh:
1. **Layered approach**: Mỗi layer có chiến lược data phù hợp
2. **Real DB cho integration/e2e**: Đảm bảo test được ORM mappings
3. **Fast feedback từ unit tests**: Phát hiện lỗi logic sớm
4. **Isolation đúng mức**: Unit tests không phụ thuộc vào infrastructure

### Điểm yếu:
1. **Thiếu live payment gateway testing**: Webhook tests dùng mock signatures
2. **Email service chưa test end-to-end**: Chỉ test event publishing
3. **Real-time features (SignalR) chưa có tests**: Cần thêm integration tests

### Khuyến nghị cải thiện:
1. Thêm **contract tests** cho payment gateway interface
2. Thêm **load tests** cho webhook idempotency
3. Thêm **SignalR hub integration tests**
4. Thêm **multi-currency calculation tests**

---

*Báo cáo được tổng hợp từ phân tích source code trong CloudServiceStore.Tests*
*Total test files: 284*.cs files across 4 test projects
