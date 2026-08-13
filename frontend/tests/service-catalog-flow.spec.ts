import { test, expect, type Page } from '@playwright/test';

const PLAN_ID = '11111111-1111-1111-1111-111111111111';
const HOSTING_PLAN_ID = '22222222-2222-2222-2222-222222222222';

const CLOUD_VPS_PLANS = {
  categoryId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  categoryName: 'Cloud VPS',
  categorySlug: 'cloud-vps',
  plans: [
    {
      id: PLAN_ID,
      name: 'Cloud VPS Pro',
      cpu: '8 Core',
      ram: '16GB',
      ssd: '150GB NVMe',
      bandwidth: 'Unlimited',
      monthlyPrice: 650000,
      yearlyPrice: 6240000,
      currency: 'VND',
    },
  ],
};

const HOSTING_PLANS = {
  categoryId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  categoryName: 'Web Hosting',
  categorySlug: 'web-hosting',
  plans: [
    {
      id: HOSTING_PLAN_ID,
      name: 'NVMe Pro',
      cpu: '2 Core',
      ram: '2GB',
      ssd: '20GB NVMe',
      bandwidth: 'Unlimited',
      monthlyPrice: 89000,
      yearlyPrice: 801000,
      currency: 'VND',
    },
  ],
};

const DOMAIN_PLANS = {
  categoryId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
  categoryName: 'Tên miền',
  categorySlug: 'ten-mien',
  plans: [
    {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Tên miền .COM',
      cpu: null,
      ram: null,
      ssd: null,
      bandwidth: null,
      monthlyPrice: null,
      yearlyPrice: 250000,
      currency: 'VND',
    },
  ],
};

function mockServiceCatalogApi(page: Page) {
  page.route(/\/api\/categories\/[^/]+\/plans(\?.*)?$/, (route) => {
    const url = route.request().url();
    let body: any = CLOUD_VPS_PLANS;

    if (url.includes('/vps/plans') || url.includes('/cloud-vps/plans')) {
      body = CLOUD_VPS_PLANS;
    } else if (url.includes('/web-hosting/plans') || url.includes('/hosting/plans')) {
      body = HOSTING_PLANS;
    } else if (url.includes('/ten-mien/plans') || url.includes('/domain/plans')) {
      body = DOMAIN_PLANS;
    }

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });

  page.route(/\/api\/categories(\?.*)?$/, (route) => {
    if (route.request().method() !== 'GET') {
      return route.continue();
    }
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: CLOUD_VPS_PLANS.categoryId, name: 'Cloud VPS', slug: 'cloud-vps' },
        { id: HOSTING_PLANS.categoryId, name: 'Web Hosting', slug: 'web-hosting' },
        { id: DOMAIN_PLANS.categoryId, name: 'Tên miền', slug: 'ten-mien' },
      ]),
    });
  });

  page.route(new RegExp(`/api/service-plans/${PLAN_ID}(\\?.*)?$`), (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: PLAN_ID,
        name: 'Cloud VPS Pro',
        categoryId: CLOUD_VPS_PLANS.categoryId,
        categoryName: 'Cloud VPS',
        categorySlug: 'cloud-vps',
        cpu: '8 Core',
        ram: '16GB',
        ssd: '150GB NVMe',
        bandwidth: 'Unlimited',
        isActive: true,
        prices: [
          { billingCycle: 'Monthly', price: 650000, currency: 'VND' },
          { billingCycle: 'Yearly', price: 6240000, currency: 'VND' },
        ],
        activePromotions: [{ id: 'promo-1', discountPercent: 15 }],
      }),
    });
  });

  page.route(new RegExp(`/api/service-plans/${PLAN_ID}/seo(\\?.*)?$`), (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: PLAN_ID,
        metaTitle: 'Cloud VPS Pro - CloudHost VN',
        metaDescription: 'Máy chủ VPS hiệu năng cao',
        keywords: 'vps,cloud',
        openGraphImage: '',
      }),
    });
  });

  page.route(new RegExp(`/api/reviews/service-plan/${PLAN_ID}(\\?.*)?$`), (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'review-1',
          servicePlanId: PLAN_ID,
          rating: 5,
          comment: 'VPS rất nhanh!',
          isApproved: true,
          isFeatured: false,
          createdAt: new Date().toISOString(),
        },
      ]),
    });
  });
}

async function gotoServicesPage(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Internal Server Error')).toHaveCount(0);
}

test.describe('Service Catalog E2E — luồng sản phẩm/dịch vụ', () => {
  test.beforeEach(async ({ page }) => {
    mockServiceCatalogApi(page);
  });

  test('Trang /services load danh mục từ API và link đúng landing', async ({ page }) => {
    await gotoServicesPage(page, '/services');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Giải Pháp Cloud Toàn Diện');
    await expect(page.getByRole('link', { name: /Cloud VPS Enterprise/i })).toHaveAttribute(
      'href',
      '/services/cloud-vps'
    );
    await expect(page.getByRole('link', { name: /NVMe Web Hosting/i })).toHaveAttribute(
      'href',
      '/services/hosting'
    );
    await expect(page.getByRole('link', { name: /Đăng Ký Tên Miền/i })).toHaveAttribute(
      'href',
      '/services/domain'
    );
  });

  test('Landing Cloud VPS hiển thị bảng giá từ API và link tới plan detail', async ({ page }) => {
    await gotoServicesPage(page, '/services/cloud-vps');

    await expect(page.getByRole('heading', { name: 'Bảng Giá Cloud VPS' })).toBeVisible();
    await expect(page.getByText('Cloud VPS Pro')).toBeVisible();
    // Mặc định toggle "Hàng Năm" → hiển thị giá yearly
    await expect(page.getByText('6.240.000')).toBeVisible();

    const detailLink = page.getByRole('link', { name: /Xem chi tiết/i }).first();
    await expect(detailLink).toHaveAttribute('href', `/services/plans/${PLAN_ID}`);
    await detailLink.click();

    await expect(page).toHaveURL(`/services/plans/${PLAN_ID}`);
    await expect(page.getByRole('heading', { name: 'Cloud VPS Pro' })).toBeVisible();
    await expect(page.getByText('8 Core')).toBeVisible();
    await expect(page.getByText('Đang giảm 15%')).toBeVisible();
  });

  test('Landing Hosting dùng slug alias hosting → API web-hosting', async ({ page }) => {
    await gotoServicesPage(page, '/services/hosting');

    await expect(page.getByText('NVMe Pro')).toBeVisible();
    await expect(page.getByRole('link', { name: /Xem chi tiết/i }).first()).toHaveAttribute(
      'href',
      `/services/plans/${HOSTING_PLAN_ID}`
    );
  });

  test('Landing Domain hiển thị gói tên miền từ API', async ({ page }) => {
    await gotoServicesPage(page, '/services/domain');

    await expect(page.getByText('Gói đăng ký phổ biến')).toBeVisible();
    await expect(page.getByText('Tên miền .COM')).toBeVisible();
  });

  test('Dynamic route /services/vps resolve alias và hiển thị bảng giá', async ({ page }) => {
    await gotoServicesPage(page, '/services/vps');

    await expect(page.getByRole('heading', { name: 'Cloud VPS' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Bảng Giá Cloud VPS' })).toBeVisible();
    await expect(page.getByText('Cloud VPS Pro')).toBeVisible();
    await expect(page.getByText('6.240.000')).toBeVisible();
  });

  test('Plan detail — chưa đăng nhập thì Thêm giỏ redirect login', async ({ page }) => {
    await gotoServicesPage(page, `/services/plans/${PLAN_ID}`);
    await expect(page.getByRole('heading', { name: 'Cloud VPS Pro' })).toBeVisible();

    await page.getByRole('button', { name: /Thêm vào giỏ hàng/i }).click();

    await expect(page).toHaveURL(new RegExp(`/login\\?redirect=`));
    expect(page.url()).toContain(encodeURIComponent(`/services/plans/${PLAN_ID}`));
  });

  test('Plan detail — đã đăng nhập thì add cart và chuyển /cart', async ({ page }) => {
    await page.route('**/api/carts/items', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'cart-item-1' }),
      });
    });

    await page.route('**/api/carts/me', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              id: 'cart-item-1',
              servicePlanId: PLAN_ID,
              title: 'Cloud VPS Pro',
              price: 650000,
              billingCycle: 'Monthly',
            },
          ],
        }),
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'mock-customer-token');
    });

    await gotoServicesPage(page, `/services/plans/${PLAN_ID}`);
    await expect(page.getByRole('heading', { name: 'Cloud VPS Pro' })).toBeVisible();
    await page.getByRole('button', { name: /Thêm vào giỏ hàng/i }).click();

    await expect(page).toHaveURL('/cart');
  });

  test('Legacy route /services/{guid} redirect sang /services/plans/{guid}', async ({ page }) => {
    await page.goto(`/services/${PLAN_ID}`, { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(`/services/plans/${PLAN_ID}`, { timeout: 15000 });
    await expect(page.getByText('Internal Server Error')).toHaveCount(0);
  });

  test('Breadcrumb plan detail link về category landing', async ({ page }) => {
    await gotoServicesPage(page, `/services/plans/${PLAN_ID}`);
    await expect(page.getByRole('heading', { name: 'Cloud VPS Pro' })).toBeVisible();

    const categoryLink = page.getByRole('link', { name: 'Cloud VPS' }).first();
    await expect(categoryLink).toBeVisible();
  });
});
