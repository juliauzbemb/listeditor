import puppeteer from "puppeteer";

const childProcess = require('child_process');


jest.setTimeout(30000);

describe('Testing popover widget', () => {
  let browser = null;
  let page = null;
  let server = null;

  const baseUrl = 'http://localhost:9000';

  beforeAll(async () => {
    server = await childProcess.fork(`${__dirname}/e2e.server.js`);
    await new Promise((resolve, reject) => {
      server.on('error', () => {
        reject();
      });
      server.on('message', (message) => {
        if (message === 'ok') {
          resolve();
        }
      });
    });

    browser = await puppeteer.launch({
      // headless: false,
      // devtools: true,
      // slowMo: 100,
    });
    page = await browser.newPage();
    })

  afterAll(async () => {
    await browser.close();
    server.kill();
  });

  test('testing popover showing on screen', async () => {
    await page.goto(baseUrl);
    await page.waitForSelector('.btn');
    const submit = await page.$('.btn');
    await submit.click();
    await page.waitForSelector('.popover').then(() => console.log('popover on screen'));
  });

  test('testing popover removing from DOM', async () => {
    await page.goto(baseUrl);
    await page.waitForSelector('.btn');
    const submit = await page.$('.btn');
    await submit.click();
    await page.waitForSelector('.popover');
    await submit.click();
    await page.waitForFunction(() => !document.querySelector('.popover')).then(() => console.log('hidden'));
    // await page.waitForSelector('.puppeteer', {hidden: true}).then(() => console.log('hidden'));
  });
})