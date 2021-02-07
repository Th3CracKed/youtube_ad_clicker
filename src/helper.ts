import { Page } from 'puppeteer';
import { findAsync } from './utils';
const any = require('promise.any');

export async function getElement(page: Page, textToSearchFor: string, selector: string, containerSelector = 'body') {
  const container = await page.$(containerSelector);
  const elements = await container.$$(selector);
  const element = await findAsync(elements, async (candidate) => {
    const text = await candidate.getProperty('textContent');
    const textContent = await text.jsonValue();
    return typeof textContent === 'string' ? textContent.toLowerCase() === textToSearchFor.toLowerCase() : false;
  });
  return element;
}

export async function checkIfTextExistsInAPage(page: Page, textToCheck: string) {
  const html = await page.evaluate(() => document.body.innerHTML);
  return html ? html.indexOf(textToCheck) !== -1 : true;
}

export async function waitForNavigation(page: Page, timeout: number, ...selectors: string[]) {
  await any(
    selectors.map(async selector => await page.waitForSelector(selector, { visible: true, timeout }))
  )
  await page.waitForFunction(() => document.readyState === 'complete');
}

export async function clearInput(page: Page, selector: string) {
  await page.focus(selector);
  const inputValue = await page.$eval(selector, (el: any) => el.value);
  for (let i = 0; i < inputValue.length; i++) {
    await page.keyboard.press('Backspace');
  }
}