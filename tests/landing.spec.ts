import { test, expect } from '@playwright/test';

test.describe('Unauthenticated Landing Page', () => {
  test('should load the homepage correctly', async ({ page }) => {
    // Navigate to the root URL
    await page.goto('/');

    // Check that the page loads and has a main heading
    // (You may need to adjust 'h1' if your title uses a different tag)
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // Verify the presence of your Clerk sign-in button
    // (Adjust the text string if your button says "Log In" or "Get Started")
    const signInButton = page.locator('text=Sign In');
    await expect(signInButton).toBeVisible();
  });

  test('should restrict access to the protected dashboard route', async ({ page }) => {
    // Attempt to navigate directly to the dashboard while logged out
    await page.goto('/dashboard');

    // Clerk should intercept this and redirect away from the dashboard.
    // We verify the URL does not remain on the protected route.
    await expect(page).not.toHaveURL('/dashboard');
  });
});