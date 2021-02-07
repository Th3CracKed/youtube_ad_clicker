import puppeteer from 'puppeteer';
import { waitForNavigation } from './helper';

import { chainAllTasksInSeries } from './utils';
const any = require('promise.any');
(async function () {
    const browser = await puppeteer.launch({ headless: false })
    console.log('Clicker started...');
    const url = "https://www.youtube.com/user/choufmedia/videos";
    try {
        const page = await browser.newPage();
        console.log(`Visiting ${url}`);
        await page.goto(url, { waitUntil: 'networkidle0' });
        console.log(`${url} loaded Successfully`);
        const urls = await page.$$eval('#video-title', (videos) => videos.map(video => 'https://youtube.com' + video.getAttribute('href')));
        console.log(urls);
        page.close();
        const sharedObject = {};
        const funcs: (() => Promise<string>)[] = urls.map(url => () => Promise.resolve(clickAds(browser, url, sharedObject)));
        const result = await chainAllTasksInSeries(funcs);
        console.log(result);
    } catch (err) {
        console.log('Chaining error');
        console.log(err);
    }
}())

async function clickAds(browser: puppeteer.Browser, url: string, sharedObject: any) {
    const page = await browser.newPage();
    let clickedSelector: string = 'No selector found';
    try {
        await page.goto(url);
        if (!sharedObject.NoThanksClicked) {
            try {
                console.log(`Clicking on thanks button...`);
                await waitForNavigation(page, 10000, 'paper-button[aria-label="No thanks"]');
                await page.click('paper-button[aria-label="No thanks"]', { delay: 200 });
                console.log(`Thanks button Clicked !`);
                await page.waitForTimeout(2000); // wait for ajax request
                await waitForNavigation(page, 10000, '#consent-bump');
                const consentUrl: string = await page.evaluate(() => {
                    const dialog: any = document.querySelector('#consent-bump');
                    return dialog.iframe.src;
                });
                await page.goto(consentUrl);
                await waitForNavigation(page, 10000, '#introAgreeButton');
                await page.click('#introAgreeButton');
                await page.waitForTimeout(2000); // wait for ajax request
                await page.goto(url);
            } catch (err) {
                console.log(err);
                console.log('An error occurred trying to accept policy agreement');
            }
        }
        sharedObject.NoThanksClicked = true;
        console.log(`playing Video...`);
        await page.keyboard.press('k');
        const playButton = await page.$('button[aria-label="Play (k)"]');
        playButton?.click();
        console.log(`Video Played`);
        const selectors = [
            '[id^="visit-advertiser"]',
            '[id^="invideo-overlay"]',
            '#action-companion-click-target',
            '.ytp-ad-overlay-title'
            // TODO support more ads type
        ];
        console.log(`Waiting for selectors...`);
        await waitForNavigation(page, 20000, ...selectors);
        console.log(`A selector is found !`);
        clickedSelector = await any(selectors.map(async selector => {
            await page.click(selector);
            return `${selector} clicked`;
        }));
        console.log(`${clickedSelector} selector(s) clicked`);
    } catch (err) {
        console.log(err);
    } finally {
        await page.waitForTimeout(2000); // wait for ads click to count
        page.close();
        return clickedSelector;
    }
}