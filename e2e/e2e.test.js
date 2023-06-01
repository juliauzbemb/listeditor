import puppeteer from "puppeteer";

const expect = require('chai').expect;

const childProcess = require('child_process');

jest.setTimeout(30000);

describe('Testing goodslist widget', () => {
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

  describe('Testing form appearing in DOM and removing from DOM', () => {
    beforeEach(async () => {
      await page.goto(baseUrl);
      await page.waitForSelector('.add');
      const addButton = await page.$('.add');
      await addButton.click();
    });

    test('testing form showing on screen', async () => {
      await page.waitForSelector('.form').then(() => console.log('form on screen'));
    });

    test('testing form removing from DOM', async () => {
      await page.waitForSelector('.form');
      const form = await page.$('.form');
      const buttonCancel = await form.$('.btn-cancel');
      buttonCancel.click();
      await page.waitForFunction(() => !document.querySelector('.form')).then(() => console.log('hidden'));
    });
  });

  describe('Testing filling in form and validation errors', () => {
    beforeEach(async () => {
      await page.goto(baseUrl);
      await page.waitForSelector('.add');
      const addButton = await page.$('.add');
      await addButton.click();
      await page.waitForSelector('.form');
    });

    test('testing valid data', async () => {
      await page.type("#name", 'iphone');
      await page.type("#price", '30000');
      const buttonSave = await page.$('.btn-submit');
      buttonSave.click();
      await page.waitForSelector('.goods-item').then(() => console.log('item added'));
    });

    test('testing no price input', async () => {
      await page.type("#name", 'iphone');
      const buttonSave = await page.$('.btn-submit');
      buttonSave.click();
      await page.waitForSelector('.form-error').then(() => console.log('form-error no price input'));
    });

    test('testing no name input', async () => {
      await page.type("#price", '60000');
      const buttonSave = await page.$('.btn-submit');
      buttonSave.click();
      await page.waitForSelector('.form-error').then(() => console.log('form-error no name input'));
    });

    test('testing not valid price input', async () => {
      await page.type("#name", 'iphone');
      await page.type("#price", 'dff');
      const buttonSave = await page.$('.btn-submit');
      buttonSave.click();
      await page.waitForSelector('.form-error').then(() => console.log('form-error not valid price'));
    });

    test('testing empty name and price input - 1 tooltip on screen', async () => {
      const buttonSave = await page.$('.btn-submit');
      buttonSave.click();
      await page.waitForSelector('.form-error');
      const length = await page.$$eval('.form-error', el => el.length);
      expect(length).to.equal(1);
    });

    test('testing no data, focus and blur - 1 tooltip on screen with certain message', async () => {
      await page.waitForSelector('input.name');
      await page.waitForSelector('input.price');

      await page.focus("input.name");
      await page.focus("input.price");

      await page.waitForSelector('.form-error');

      const length = await page.$$eval('.form-error', el => el.length);
      expect(length).to.equal(1);

      const message = await page.$eval('.form-error', el => el.textContent);
      expect(message).to.include('название');
    });

    test('testing no data, focus and blur - 2 tooltips on screen', async () => {
      await page.waitForSelector('input.name');
      await page.waitForSelector('input.price');

      await page.focus("input.name");
      await page.focus("input.price");
      await page.focus("input.name");

      await page.waitForSelector('.form-error');

    // 1 вариант
    // const length = await page.$$eval('.form-error', el => el.length);
    // expect(length).to.equal(2);
    // 2 вариант
      const info = await page.$$eval('.form-error', elements => elements.map(item => item.textContent));
      console.log(info);
      expect(info.length).to.equal(2);
    });
  });

  describe('Testing updating list function', () => {
    beforeEach(async () => {
      await page.goto(baseUrl);

      await page.waitForSelector('.add');

      const addButton = await page.$('.add');
      await addButton.click();

      await page.waitForSelector('.form');
      await page.waitForSelector('input.name');
      await page.waitForSelector('input.price');

      await page.type("#name", "iphone 6");
      await page.type("#price", "50000");
      const buttonSave = await page.$('.btn-submit');
      await buttonSave.click();

      await page.waitForSelector('input.name');
      await page.waitForSelector('input.price');

      await page.type("#name", "iphone 7");
      await page.type("#price", "60000");
      await buttonSave.click();

      await page.waitForSelector('input.name');
      await page.waitForSelector('input.price');

      await page.type("#name", "iphone 8");
      await page.type("#price", "70000");
      await buttonSave.click();

      const buttonCancel = await page.$('.btn-cancel');
      await buttonCancel.click();

      await page.waitForSelector('.goods-item');
    });

    test('testing 3 items in the list', async () => {
      const count = await page.$$eval('.goods-item', el => el.length);
      expect(count).to.equal(3);
    });

    test('testing updating 1st item', async () => {
      await page.waitForSelector('.edit');

      const editElements = await page.$$('.edit');
      await editElements[0].click();

      await page.waitForSelector('.form');
      await page.waitForSelector('input.name');
      await page.waitForSelector('input.price');

      await page.evaluate(() => document.getElementById('name').value = 'iphone 6');
      await page.evaluate(() => document.getElementById('price').value = '100000');

      await page.$('.btn-submit');

      await page.evaluate(() => document.querySelector('.btn-submit').click());

      await page.waitForFunction(() => !document.querySelector('.form')).then(() => console.log('form hidden after updating 1st item'));

      await page.waitForSelector('.price');

      const res = await page.evaluate(() => [...document.querySelectorAll('.price')][0].textContent);

      expect(res).to.equal("100000");
    });

    test('testing 1st item delete', async () => {
      await page.waitForSelector('.delete');
      const deleteElements = await page.$$('.delete');
      await deleteElements[0].click();
  
      await page.waitForSelector('.delete-confirm');
      const confirmButton = await page.$('.btn-delete-submit');
      await confirmButton.click();
      
      await page.waitForSelector('.goods-item');

      const count = await page.$$eval('.goods-item', el => el.length);
      expect(count).to.equal(2);
    });

    test('testing cancelling 1st item delete', async () => {
      await page.waitForSelector('.delete');
      const deleteElements = await page.$$('.delete');
      await deleteElements[0].click();

      await page.waitForSelector('.delete-confirm');
      const cancelButton = await page.$('.btn-delete-cancel');
      await cancelButton.click();

      await page.waitForSelector('.goods-item');
      const countAfterCancel = await page.$$eval('.goods-item', el => el.length);
      expect(countAfterCancel).to.equal(3)
    });
  });
})