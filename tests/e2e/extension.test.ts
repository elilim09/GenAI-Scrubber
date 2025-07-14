import puppeteer from 'puppeteer';
import { test } from 'vitest';

const execPath = process.env.PUPPETEER_EXECUTABLE_PATH;
if (!execPath) {
  test.skip('e2e skipped: no browser', () => {});
  console.warn('PUPPETEER_EXECUTABLE_PATH not set');
} else {
  test('paste sanitizes text', async () => {
    const browser = await puppeteer.launch({ executablePath: execPath });
    const page = await browser.newPage();
    await page.setContent('<textarea id="t"></textarea>');
    await page.focus('#t');
    await page.evaluate(() => navigator.clipboard.writeText('010-1234-5678'));
    await page.keyboard.down('Control');
    await page.keyboard.press('v');
    await page.keyboard.up('Control');
    const value = await page.$eval('#t', (el: HTMLTextAreaElement) => el.value);
    if (value.includes('010-1234-5678')) {
      throw new Error('phone number not scrubbed');
    }
    await browser.close();
  });
}
