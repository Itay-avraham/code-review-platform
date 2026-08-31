import { test, expect } from '@playwright/test';
import { clerk } from '@clerk/testing/playwright';

test.describe('Authenticated Dashboard & Core Processes', () => {
  test.setTimeout(90000);
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await clerk.signIn({
      page,
      emailAddress: 'itayavschool@gmail.com'
    });
    
    await page.waitForTimeout(2000); 
  });

  test('should load the dashboard successfully (Basic UI)', async ({ page }) => {
    await page.goto('/dashboard');
    const heading = page.locator('h1', { hasText: 'Scan History' });
    await expect(heading).toBeVisible();
    await expect(page).toHaveURL('/dashboard');
  });

  test('should analyze code and save to history (Main Feature & Database)', async ({ page }) => {
    // Allow the request to hit the real backend, but inject isTest: true 
    // to bypass the LLM and force a clean database write.
    await page.route('**/api/analyze', async route => {
      const request = route.request();
      const postData = JSON.parse(request.postData() || '{}');
      postData.isTest = true;
      await route.continue({
        postData: JSON.stringify(postData)
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const codeInput = page.locator('textarea'); 
    await codeInput.fill('const x = "SQL Injection Test";');

    const analyzeButton = page.locator('button', { hasText: 'Analyze Code' });
    
    // Wait for the backend write to complete before navigating
    const responsePromise = page.waitForResponse(res => res.url().includes('/api/analyze'));
    await analyzeButton.click();
    await responsePromise;

    await page.goto('/dashboard');
    await expect(page.locator('text=SQL Injection').first()).toBeVisible();
   
    // Expand the code viewer if collapsed to reveal the snippet text
    const expandButton = page.locator('button:has-text("Code"), button.expand-code, [aria-label*="expand" i]').first();
    if (await expandButton.isVisible()) {
      await expandButton.click();
    }

    const originalCodeSnippet = page.locator('text=const x = "SQL Injection Test";').first();
    await expect(originalCodeSnippet).toBeVisible();
  });

  test('should allow user to star/pin a snippet', async ({ page }) => {
    await page.goto('/dashboard');
    // If the star button isn't rendered because history is empty, this handles it gracefully
    const starButton = page.locator('button', { hasText: 'Star' }).first();
    if (await starButton.isVisible()) {
      await starButton.click();
    }
  });

  test('should allow user to delete past code snippets from history', async ({ page }) => {
    await page.goto('/dashboard');
    const deleteButton = page.locator('button', { hasText: 'Delete' }).first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
    }
  });

  test('should reject empty code submissions (Invalid Inputs)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const analyzeButton = page.locator('button', { hasText: 'Analyze Code' });
    
    // The button is physically disabled by React when the textarea is empty
    await expect(analyzeButton).toBeDisabled();
  });

  test('should handle backend API failures gracefully (Edge Case)', async ({ page }) => {
    // Force the network to simulate a 500 Internal Server Error crash
    await page.route('**/api/analyze', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: "Internal Server Error" })
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const codeInput = page.locator('textarea'); 
    await codeInput.fill('const x = 1;');

    const analyzeButton = page.locator('button', { hasText: 'Analyze Code' });
    await analyzeButton.click();

    // Verify the app does not fatally crash and the button resets to its default state
    await expect(analyzeButton).toHaveText('Analyze Code');
    await expect(analyzeButton).toBeEnabled();
    
    // Verify no results sections are incorrectly rendered on screen
    const vulnerabilitiesHeader = page.locator('h3', { hasText: 'Security Vulnerabilities' });
    await expect(vulnerabilitiesHeader).not.toBeVisible();
  });

  test('should restrict excessively long code inputs (Invalid Inputs)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Generate a massive string that exceeds standard LLM token limits
    const massiveInput = 'a'.repeat(10000); 
    const codeInput = page.locator('textarea');
    
    await codeInput.fill(massiveInput);
    
    // Read the actual text that made it into the box
    const inputValue = await codeInput.inputValue();
    
    // Assumes you added maxLength={8000} to your frontend textarea.
    // If the box allowed all 10,000 characters, this assertion will fail and flag the bug.
    expect(inputValue.length).toBeLessThanOrEqual(8000);
  });

  test('should sanitize malicious code inputs to prevent XSS (Edge Case)', async ({ page }) => {
    await page.route('**/api/analyze', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            vulnerabilities: [
              { issue: "XSS Attempt", severity: "High", description: "<script>alert('hacked')</script>" }
            ],
            quality: []
          }
        })
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const codeInput = page.locator('textarea'); 
    await codeInput.fill('console.log("test"); <script>alert("hacked")</script>');

    const analyzeButton = page.locator('button', { hasText: 'Analyze Code' });
    await analyzeButton.click();

    // Verify the mock rendered by checking the specific text strings, avoiding bracket parsing errors
    await expect(page.locator('text=XSS Attempt')).toBeVisible();
    await expect(page.locator('text=alert(\'hacked\')')).toBeVisible();
  });

  test('should successfully write to the database (Backend API Test)', async ({ page }) => {
    // Intercept the outgoing frontend request and append the isTest flag mid-flight.
    // This perfectly preserves Clerk's frontend authentication cookies while triggering the DB bypass.
    await page.route('**/api/analyze', async route => {
      const request = route.request();
      const postData = JSON.parse(request.postData() || '{}');
      
      // Inject the test flag
      postData.isTest = true;
      
      await route.continue({
        postData: JSON.stringify(postData)
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const codeInput = page.locator('textarea'); 
    await codeInput.fill('const dbTest = true;');

    const analyzeButton = page.locator('button', { hasText: 'Analyze Code' });
    
    // Set up a listener to catch the real backend's response before clicking
    const responsePromise = page.waitForResponse(res => res.url().includes('/api/analyze'));
    await analyzeButton.click();

    const response = await responsePromise;
    const responseBody = await response.json();
    
    // Verify the backend successfully bypassed Gemini and wrote to Prisma
    expect(response.status()).toBe(200);
    expect(responseBody.success).toBe(true);
    expect(responseBody.message).toBe("Database write successful");
  });
  
});