describe('Amazon', () => {
  test('went to webpage', async () => {
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto('https://www.amazon.com/');
    await expect(page.title()).resolves.toMatch('Amazon');
  });

  test('has search input', async () => {
    await page.waitForSelector('#twotabsearchtextbox');
    expect('#twotabsearchtextbox').not.toBeUndefined();
  });

  test('shows search results after searching', async () => {
    await page.type('#twotabsearchtextbox', 'my dark vanessa hardcover');
    await page.keyboard.press('Enter');
    expect('div.s-main-slot').not.toBeUndefined();
  });

  test('clicks on first result', async () => {
    await page.waitForSelector('h2');
    expect('h2').not.toBeUndefined();
    await page.click('h2>a');
  });

  test('puts item in the cart', async () => {
    await page
      .waitForSelector("input[title='Add to Shopping Cart']", { timeout: 2500 })
      .then(() => {
        page.click("input[title='Add to Shopping Cart']");
      })
      .catch(async (err: Error) => {
        console.error('Not available from Amazon directly. \nError:', err);

        await page.waitForSelector('#buybox-see-all-buying-choices');
        await page.click('#buybox-see-all-buying-choices');
        await page.waitForNavigation({ waitUntil: 'load' });
        await page.waitForSelector("input[name='submit.addToCart']");
        await page.click("input[name='submit.addToCart']");
        await new Promise(resolve => setTimeout(resolve, 3000));
        expect(
          await page.$eval('#nav-cart-count', node => node.innerHTML),
        ).toBe('1');
        await page.goto(
          'https://www.amazon.com/gp/cart/view.html/ref=aod_dpdsk_used_1_cart?',
        );
      });
  }, 15000);

  test('go to checkout', async () => {
    await page.waitForSelector('#sc-buy-box-ptc-button');
    expect('#sc-buy-box-ptc-button').not.toBeUndefined();
    await page.click('#sc-buy-box-ptc-button');
  });
});
