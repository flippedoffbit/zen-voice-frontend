import { test, expect } from '@playwright/test';

// Run prerequisites (manual):
// 1) Start backend in FIXED_OTP dev mode so OTP is predictable:
//    FIXED_OTP=1234 FIXED_OTP_EMAIL=test@example.com npm run dev  (in backend repo)
// 2) Start frontend dev server:
//    npm run dev
// 3) Update the `baseURL` in your Playwright config to point to the running frontend (default http://localhost:5173)

// This E2E spec assumes the frontend implements the Email OTP flow and UI described in the prompt.

test.describe('Login flow (email OTP) - E2E', () => {
    test('request OTP for email, verify with FIXED_OTP, expect authenticated user', async ({ page }) => {
        // Visit login page
        await page.goto('/login');

        // Choose Email tab - make selector robust to either a tab, radio, or toggle
        const emailTab = await page.locator('role=tab[name=/email/i]').first();
        if (await emailTab.count() > 0) {
            await emailTab.click();
        } else {
            // fallback: a button labeled Email
            const emailBtn = page.locator('button:has-text("Email")').first();
            if (await emailBtn.count() > 0) await emailBtn.click();
        }

        // Fill email and request OTP
        await page.fill('label:has-text("Email") >> input', 'test@example.com');
        await page.click('button:has-text("Send OTP")');

        // Wait for toast/modal advising OTP sent
        await expect(page.locator('text=OTP sent')).toBeVisible({ timeout: 5000 });

        // Enter the known fixed OTP
        await page.fill('label:has-text("OTP") >> input', '1234');
        await page.click('button:has-text("Verify")');

        // Expect redirect to home and UI indicating logged-in state (header contains profile or logout)
        await expect(page).toHaveURL('/');
        await expect(page.locator('text=Logout').first()).toBeVisible({ timeout: 5000 });
    });
});
