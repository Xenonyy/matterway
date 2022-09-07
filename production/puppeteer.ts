import puppeteer from "puppeteer";
import prompt from "prompt-sync";
import { GenreTypes } from "../genreTypes";

// Possible types:
// fiction, mystery-thriller, historical-fiction, fantasy, romance, science-fiction, horror, humor, nonfiction, memoir-autobiography, history-biography, science-technology, food-cookbooks, graphic-novels-comics, poetry, debut-novel, young-adult-fiction, young-adult-fantasy, childrens, picture-books
const genre: GenreTypes = prompt({ sigint: true })(
  "What genre are you interested in? "
) as GenreTypes;

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const bookPage = await browser.newPage();
  await bookPage.setViewport({ width: 1920, height: 1080 });
  await bookPage.goto(
    `https://www.goodreads.com/choiceawards/best-${genre}-books-2020`,
    { waitUntil: "networkidle0" }
  );
  await bookPage.evaluate(() => {
    const books = document.querySelectorAll("a.pollAnswer__bookLink");
    const randomIndex = Math.floor(Math.random() * books.length);

    (books[randomIndex] as HTMLElement).click();
  });
  await bookPage.waitForNavigation({ waitUntil: "load" });
  let titleNode = await bookPage.$("h1");
  let title = await bookPage.evaluate(
    (element) => element?.textContent ?? element?.nodeValue,
    titleNode
  );
  await bookPage.close();

  const amazon = await browser.newPage();
  await amazon.setViewport({ width: 1920, height: 1080 });
  await amazon.goto("https://www.amazon.com", {
    waitUntil: "networkidle0",
  });
  await amazon.waitForSelector("#twotabsearchtextbox");
  await amazon.type("#twotabsearchtextbox", `${title + " paperback"}`);
  await amazon.keyboard.press("Enter");
  await amazon.waitForSelector("h2");
  await amazon.evaluate(() => {
    const item = document.querySelector("h2>a");

    (item as HTMLElement).click();
  });
  await amazon.waitForSelector("#add-to-cart-button");
  await amazon.click("#add-to-cart-button");
  await amazon.waitForSelector("#sc-buy-box-ptc-button");
  await amazon.click("#sc-buy-box-ptc-button");
  await browser.close();
})();
