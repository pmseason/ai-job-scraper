"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrape = scrape;
const utils_1 = require("../../lib/utils");
async function scrape(browser, keyword, roleType) {
    const page = await browser.newPage();
    try {
        //go to url, no prefilling data
        await page.goto(roleType == "apm" ?
            `https://www.lifeattinder.com/?departments=product%7Cproductmanagement%7Cproductanalytics&search=${encodeURIComponent(keyword)}&job-type=fulltime#open-positions` : `https://www.lifeattinder.com/?departments=product%7Cproductmanagement%7Cproductanalytics&search=${encodeURIComponent(keyword)}&job-type=internship#open-positions`);
        //not working rn
        const noJobsSelector = "div[class*=jetboost-list-wrapper-empty]";
        const noJobs = await page.$eval(noJobsSelector, (div) => {
            // console.log(div.classList)
            return !div.classList.contains('jetboost-list-item-hide');
        });
        if (noJobs) {
            return { rawJobs: [], success: true, count: 0 };
        }
        // Navigate through more positions (pagination)
        const morePositionsSelector = 'a[class*="jetboost-pagination-next-"]';
        for (let i = 0; i < 5; i++) {
            const loadMoreButton = await page.$(morePositionsSelector);
            if (!loadMoreButton)
                break;
            await page.evaluate((button) => {
                button.scrollIntoView({ behavior: 'smooth' });
            }, loadMoreButton);
            await loadMoreButton.click();
            await (0, utils_1.delay)(1000);
        }
        // Wait for job cards to load
        const jobCardSelector = "div[role='list'].positions-grid div[role='listitem']";
        const jobCards = await page.$$(jobCardSelector);
        // Extract job data
        const rawJobs = await Promise.all(jobCards.map(async (jobCard) => {
            const textContent = await jobCard.$$eval("div", (elements) => elements
                .map((element) => element.textContent?.trim() || "")
                .filter((text) => text.length > 0));
            const link = await jobCard.$eval("a", (element) => element.href);
            return { textContent, link };
        }));
        return { rawJobs, success: true, count: rawJobs.length };
    }
    catch (error) {
        const err = error;
        console.error("Error during Tider audit:", error);
        return { rawJobs: [], success: false, error: err.message, count: 0 };
    }
    finally {
        await page.close();
    }
}
