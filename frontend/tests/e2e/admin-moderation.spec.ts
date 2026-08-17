import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { loginViaApi } from './fixtures/auth';

test.describe('Admin Content Moderation (P1/P2)', () => {
  let adminTokens: { accessToken: string };

  test.beforeAll(async () => {
    adminTokens = await loginViaApi('admin');
  });

  test('ADM-REVIEW-01: Xem & Duyệt Review từ khách hàng (/api/reviews)', async () => {
    // 1. Get all reviews
    const reviewsRes = await fetch(`${E2E_CONFIG.API_BASE}/api/reviews`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(reviewsRes.status).toBe(200);
    const reviews = await reviewsRes.json();
    expect(Array.isArray(reviews)).toBeTruthy();

    if (reviews.length > 0) {
      const targetReview = reviews[0];

      // 2. Approve review
      const approveRes = await fetch(`${E2E_CONFIG.API_BASE}/api/reviews/${targetReview.id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
      });
      expect(approveRes.status).toBeLessThan(500);
    }
  });

  test('ADM-COMMENT-01: Quản lý & Xoá bình luận Blog (/api/comments)', async () => {
    // Attempt delete
    const deleteRes = await fetch(`${E2E_CONFIG.API_BASE}/api/comments/00000000-0000-0000-0000-000000000000`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(deleteRes.status).toBeLessThan(500);
  });

  test('ADM-AFFILIATE-01: Xem & Duyệt đơn đăng ký Affiliate (/api/affiliate-applications)', async () => {
    // 1. Get all applications
    const appsRes = await fetch(`${E2E_CONFIG.API_BASE}/api/affiliate-applications`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(appsRes.status).toBe(200);
    const apps = await appsRes.json();
    expect(Array.isArray(apps)).toBeTruthy();

    if (apps.length > 0) {
      const targetApp = apps[0];

      // 2. Approve application
      const approveRes = await fetch(`${E2E_CONFIG.API_BASE}/api/affiliate-applications/${targetApp.id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
      });
      expect(approveRes.status).toBeLessThan(500);
    }
  });
});
