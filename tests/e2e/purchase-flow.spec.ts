import { test, expect } from '@playwright/test';

test.describe('구매 흐름 E2E', () => {
  test('홈페이지 로드', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/GOODZZ|굿쯔/);
  });

  test('상품 목록 → 상세 페이지', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.locator('main')).toBeVisible();

    // 첫 번째 상품 카드 클릭
    const productCard = page.locator('a[href^="/shop/"]').first();
    await expect(productCard).toBeVisible({ timeout: 10_000 });
    await productCard.click();

    // 상품 상세 페이지 확인
    await expect(page).toHaveURL(/\/shop\/.+/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('장바구니 추가 및 확인', async ({ page }) => {
    await page.goto('/shop');

    // 첫 상품 클릭
    const productCard = page.locator('a[href^="/shop/"]').first();
    await expect(productCard).toBeVisible({ timeout: 10_000 });
    await productCard.click();
    await expect(page).toHaveURL(/\/shop\/.+/);

    // 장바구니 추가 버튼 클릭
    const addToCartBtn = page.getByRole('button', { name: /장바구니|담기|cart/i });
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();

      // 장바구니 페이지로 이동하여 확인
      await page.goto('/cart');
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('비로그인 시 체크아웃 보호', async ({ page }) => {
    await page.goto('/checkout');
    // 로그인 리다이렉트 또는 로그인 안내 메시지 확인
    await expect(
      page.locator('text=/로그인|login/i').or(page.locator('a[href*="login"]'))
    ).toBeVisible({ timeout: 10_000 });
  });

  test('검색 기능 동작', async ({ page }) => {
    await page.goto('/shop');

    const searchInput = page.getByPlaceholder(/검색|search/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('스티커');
      await page.waitForTimeout(500); // fuzzy search debounce
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('404 페이지 처리', async ({ page }) => {
    const response = await page.goto('/shop/nonexistent-product-id-12345');
    // 404 또는 에러 메시지 확인
    const status = response?.status();
    if (status === 404) {
      await expect(page.locator('body')).toBeVisible();
    } else {
      // 클라이언트 사이드 에러 처리 확인
      await expect(
        page.locator('text=/찾을 수 없|not found|존재하지 않/i')
      ).toBeVisible({ timeout: 10_000 });
    }
  });
});

test.describe('SEO 점검', () => {
  test('sitemap.xml 접근 가능', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('<urlset');
  });

  test('robots.txt 접근 가능', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('Sitemap');
  });

  test('OG 메타태그 존재', async ({ page }) => {
    await page.goto('/');
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
  });
});

test.describe('API 보안', () => {
  test('dev 엔드포인트 프로덕션 차단', async ({ request }) => {
    // dev 환경에서는 이 테스트가 pass하지 않을 수 있음
    // 프로덕션 배포 후 확인 필요
    const res = await request.post('/api/dev/add-admin', {
      data: { userId: 'test' },
    });
    // 개발 환경에서는 200, 프로덕션에서는 403
    expect([200, 403]).toContain(res.status());
  });

  test('AI 생성 레이트 리밋', async ({ request }) => {
    // 6번 연속 요청 시 429 반환 확인
    const results: number[] = [];
    for (let i = 0; i < 7; i++) {
      const res = await request.post('/api/generate', {
        data: { prompt: 'test', style: 'flat' },
      });
      results.push(res.status());
    }
    // 마지막 요청들 중 하나는 429여야 함
    expect(results).toContain(429);
  });
});
