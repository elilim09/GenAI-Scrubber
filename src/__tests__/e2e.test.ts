import puppeteer from 'puppeteer';
import { expect, test } from 'vitest';

test('paste sanitizes text', async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://chat.openai.com');
  await page.evaluate(() => {
    document.body.innerHTML = '<textarea id="t"></textarea>';
  });
  await page.focus('#t');
  await page.evaluate(() => navigator.clipboard.writeText('010-1234-5678'));
  await page.keyboard.down('Control');
  await page.keyboard.press('v');
  await page.keyboard.up('Control');
  const value = await page.$eval('#t', (el: HTMLTextAreaElement) => el.value);
  expect(value).not.toContain('010-1234-5678');
  await browser.close();
});
