"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = search;
const utils_1 = require("../../lib/utils");
async function search(browser, keyword) {
    const page = await browser.newPage();
    try {
        //go to page
        await page.goto(`https://www.linkedin.com/jobs/search/?f_C=1337%2C39939%2C2587638%2C9202023&geoId=103644278&keywords=${encodeURIComponent(keyword)}`);
        // await this.fillForm({page, keyword});
        // Check for existence of the no-results banner
        const noResults = await page.$('div.jobs-search-no-results-banner');
        if (noResults) {
            return { rawJobs: [], success: true, message: "No jobs found from this source" };
        }
        //scroll pagination into view
        const paginationSelector = 'div.jobs-search-pagination';
        const nextButtonSelector = `${paginationSelector} button[aria-label='View next page']`;
        const jobCardSelector = 'div.scaffold-layout__list > div > ul div.job-card-container';
        const jobCards = [];
        for (let i = 0; i < 3; i++) {
            const paginationElement = await page.$(paginationSelector);
            if (paginationElement) {
                await page.evaluate((element) => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
                }, paginationElement);
            }
            await (0, utils_1.delay)(4000); //wait for jobs 2 load
            await page.waitForSelector(jobCardSelector);
            const temp = await page.$$(jobCardSelector);
            jobCards.push(...temp);
            const nextButton = await page.$(nextButtonSelector);
            if (!nextButton)
                break;
            await nextButton.click();
        }
        await (0, utils_1.delay)(2500);
        // Extract text content and link from each job card
        const rawJobs = await Promise.all(jobCards.map(async (jobCard) => {
            const textContent = await jobCard.$$eval('a, span, li', (elements) => elements
                .map((element) => element.textContent?.trim() || "")
                .filter((text) => text.length > 0));
            const link = await jobCard.$eval('a.job-card-container__link', (element) => element.href);
            return { textContent, link };
        }));
        return { rawJobs, success: true, count: rawJobs.length };
    }
    catch (error) {
        const err = error;
        console.error("Error during LinkedIn audit:", error);
        return { rawJobs: [], success: false, error: err.message };
    }
    finally {
        await page.close();
    }
}
