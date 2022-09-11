import puppeteer from "puppeteer";
import prompt from "prompt-sync";
import { GenreTypes } from "./types/genreTypes";

// Possible types:
// fiction, mystery-thriller, historical-fiction, fantasy, romance, science-fiction, horror, humor, nonfiction, memoir-autobiography, history-biography, science-technology, food-cookbooks, graphic-novels-comics, poetry, debut-novel, young-adult-fiction, young-adult-fantasy, childrens, picture-books
const genre: GenreTypes = prompt({ sigint: true })(
  "What genre are you interested in? "
) as GenreTypes;

(async () => {
  // Book Page
  const browser = await puppeteer.launch();
  const bookPage = await browser.newPage();
  await bookPage.setViewport({ width: 1920, height: 1080 });
  await bookPage
    .goto(`https://www.goodreads.com/choiceawards/best-${genre}-books-2020`, {
      waitUntil: "networkidle0",
      timeout: 15000,
    })
    .catch((err: Error) => {
      console.error("The page didn't load. \nError: ", err);
      browser.close();
    });

  await bookPage.evaluate(() => {
    const books = document.querySelectorAll("a.pollAnswer__bookLink");
    const randomIndex = Math.floor(Math.random() * books.length);

    (books[randomIndex] as HTMLElement).click();
  });

  await bookPage.waitForSelector("h1");
  let titleNode = await bookPage.$("h1");
  let title = await bookPage.evaluate(
    (element) => element?.textContent ?? element?.nodeValue,
    titleNode
  );
  console.log(title);
  await bookPage.screenshot({ path: "./src/screenshots/book.png" });
  await bookPage.close();

  // Amazon
  const amazon = await browser.newPage();
  await amazon.setViewport({ width: 1920, height: 1080 });
  await amazon
    .goto("https://www.amazon.com", {
      waitUntil: "networkidle0",
      timeout: 15000,
    })
    .catch((err: Error) => {
      console.error("The page didn't load. \nError: ", err);
      browser.close();
    });
  try {
    await amazon.click("#twotabsearchtextbox");
  } catch (err: unknown) {
    console.error("Searchbar not found. \nError: ", err);
  } finally {
    await amazon.reload();
    await amazon.waitForSelector("#twotabsearchtextbox");
    await amazon.click("#twotabsearchtextbox");
    await amazon.keyboard.type(`${title + " paperback"}`);
    await amazon.keyboard.press("Enter");
    await amazon.screenshot({ path: "./src/screenshots/search.png" });
  }

  await amazon.waitForSelector("h2");
  await amazon.evaluate(() => {
    const item = document.querySelector("h2>a");

    (item as HTMLElement).click();
  });
  await amazon.screenshot({ path: "./src/screenshots/result.png" });

  await amazon
    .waitForSelector("#add-to-cart-button", { timeout: 5000 })
    .then(async () => {
      await amazon.click("#add-to-cart-button");
      await amazon.screenshot({ path: "./src/screenshots/item.png" });
    })
    .catch(async (err: Error) => {
      console.log("Not available from Amazon directly. \nError:", err);

      await amazon.waitForSelector("#buybox-see-all-buying-choices");
      await amazon.click("#buybox-see-all-buying-choices");
      await amazon.waitForSelector('input[name="submit.addToCart"]');
      await amazon.click('input[name="submit.addToCart"]');
      await new Promise((r) => setTimeout(r, 2500));
      await amazon.goto(
        "https://www.amazon.com/gp/cart/view.html/ref=aod_dpdsk_used_1_cart?"
      );
      await amazon.screenshot({ path: "./src/screenshots/item.png" });
    });

  await amazon.waitForSelector("#sc-buy-box-ptc-button");
  await amazon.click("#sc-buy-box-ptc-button");
  await amazon.screenshot({ path: "./src/screenshots/cart.png" });
  await browser.close();
})();
