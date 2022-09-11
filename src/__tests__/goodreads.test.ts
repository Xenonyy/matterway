describe("Goodreads", () => {
  test("went to webpage", async () => {
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto("https://www.goodreads.com/");
    await expect(page.title()).resolves.toMatch("Goodreads");
  });

  test("selected random book", async () => {
    await page.goto(
      "https://www.goodreads.com/choiceawards/best-fiction-books-2020"
    );
    await page.evaluate(() => {
      const books = document.querySelectorAll("a.pollAnswer__bookLink");
      const randomIndex = Math.floor(Math.random() * books.length);

      (books[randomIndex] as HTMLElement).click();
    });
  });

  test("book has title", async () => {
    expect("h1").not.toBeUndefined();
  });
});
