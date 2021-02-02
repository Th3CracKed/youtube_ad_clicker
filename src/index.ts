import puppeteer from 'puppeteer';
import { waitForNavigation } from './helper';

import { chainAllTasksInSeries } from './utils';
(async function () {
    const browser = await puppeteer.launch({ headless: false })
    try {
        const page = await browser.newPage();
        await page.goto('https://www.youtube.com/user/choufmedia/videos', { waitUntil: 'networkidle0' });
        page.setCookie(
            { name: 'CONSENT', value: 'YES+FR.en+V9+BX', domain: '.youtube.com' },
            { name: 'CONSENT', value: 'YES+FR.en+V9+BX', domain: 'www.youtube.com' },
        );
        const urls = await page.$$eval('#video-title', (videos) => videos.map(video => 'https://youtube.com' + video.getAttribute('href')));
        page.close();
        const sharedObject = {};
        const funcs: (() => Promise<void>)[] = urls.map(url => () => Promise.resolve(clickAds(browser, url, sharedObject)));
        await chainAllTasksInSeries(funcs);
        console.log('Done');
    } catch (err) {
        console.error('Something Wrong happened while creating an account');
        console.error(err);
    }
}())

async function clickAds(browser: puppeteer.Browser, url: string, sharedObject: any) {
    const page = await browser.newPage();
    try {
        await page.goto(url);
        if (!sharedObject.NoThanksClicked) {
            await waitForNavigation(page, 10000, 'paper-button[aria-label="No thanks"]');
            await page.click('paper-button[aria-label="No thanks"]', { delay: 200 });
        }
        sharedObject.NoThanksClicked = true
        await page.keyboard.press('k');
        const playButton = await page.$('button[aria-label="Play (k)"]');
        playButton?.click();
        const selectors = [
            '[id^="visit-advertiser"]',
            '[id^="invideo-overlay"]',
            '#action-companion-click-target',
            '.ytp-ad-overlay-title'
            // TODO support more ads type
        ];
        await waitForNavigation(page, 20000, ...selectors);
        await Promise.all(selectors.map(selector => page.click(selector)));
    } catch (err) {
        console.error(err);
    } finally {
        await page.waitForTimeout(2000); // wait for ads click to count
        page.close();
    }
}