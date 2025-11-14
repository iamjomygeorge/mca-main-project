const { test, expect } = require("@playwright/test");

const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

test.describe("Inkling Core User Flows", () => {
  // TEST 1: LOGIN VERIFICATION
  test("User can log in and see authenticated header", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[id="email-address"]', TEST_EMAIL);
    await page.fill('input[id="password"]', TEST_PASSWORD);
    await page.click('button:has-text("Log In")');
    await expect(
      page.locator('header button:has-text("Logout")')
    ).toBeVisible();
  });

  // TEST 2: BOOK DISCOVERY & DETAILS
  test("Guest can navigate from library to book details", async ({ page }) => {
    await page.goto("/books");
    const firstBook = page.locator('a[href^="/books/"]').first();
    await expect(firstBook).toBeVisible({ timeout: 5000 });
    const bookTitle = await firstBook.locator("h3").innerText();
    await firstBook.click();
    await expect(page).toHaveURL(/\/books\/[a-zA-Z0-9-]+/);
    await expect(page.locator("h1")).toHaveText(bookTitle);
    await expect(page.locator('button:has-text("Buy Now")')).toBeVisible();
  });

  // TEST 3: CONTACT FORM SUBMISSION
  test("User can successfully submit a contact inquiry", async ({ page }) => {
    await page.goto("/contact");
    await page.fill('input[id="name"]', "Playwright Bot");
    await page.fill('input[id="email"]', "bot@testing.com");
    await page.fill(
      'textarea[id="message"]',
      "This is a high-priority test message verifying API integration."
    );
    await page.click('button:has-text("Send Message")');
    await expect(page.locator("text=Thank You!")).toBeVisible();
  });

  // TEST 4: AUTHENTICATED ROUTE ACCESS
  test("Authenticated user can view their 'My Library' page", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill('input[id="email-address"]', TEST_EMAIL);
    await page.fill('input[id="password"]', TEST_PASSWORD);
    await page.click('button:has-text("Log In")');
    await expect(
      page.locator('header button:has-text("Logout")')
    ).toBeVisible();
    await page.goto("/my-library");
    await expect(page.locator("h1")).toHaveText("My Library");
    await expect(page.locator("text=Your library is empty")).toBeVisible();
  });
});