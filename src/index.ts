import { ElementHandle, Page } from 'puppeteer';
import puppeteer from 'puppeteer';
import { waitForNavigation } from './helper';
(async function () {
    const browser = await puppeteer.launch({ headless: false })
    try {
        const page = await browser.newPage();
        await page.goto('https://www.youtube.com/user/choufmedia/videos', { waitUntil: 'networkidle0' });
        page.setCookie(
            { name: 'CONSENT', value: 'YES+FR.en+V9+BX', domain: '.youtube.com' },
            { name: 'CONSENT', value: 'YES+FR.en+V9+BX', domain: 'www.youtube.com' },
        );
        const videos = await page.$$('#video-title');
        // videos.forEach(async video => await clickAds(page, video));)
        clickAds(page, videos[0]);
    } catch (err) {
        console.error('Something Wrong happened while creating an account');
        console.error(err);
    }
}())

async function clickAds(page: Page, video: ElementHandle<Element>) {
    await video.click();
    await waitForNavigation(page, 30000, '#player');
    await waitForNavigation(page, 10000, 'paper-button[aria-label="No thanks"]');
    await page.click('paper-button[aria-label="No thanks"]', { delay: 200 });
    // await page.waitForTimeout(4000);
    await page.keyboard.press('k');
    const selectors = [
        '[id^="visit-advertiser"]',
        '[id^="invideo-overlay"]',
        '#action-companion-click-target'
    ];
    await waitForNavigation(page, 10000, ...selectors);
    try {
        await Promise.all(selectors.map(selector => page.click(selector)));
    } finally {
        page.close();
    }

    //ytp-ad-skip-button
}