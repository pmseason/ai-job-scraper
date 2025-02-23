"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrape = scrape;
const utils_1 = require("../../lib/utils");
async function scrape(input) {
    const { browser, searchConfig } = input;
    const { scrapeFrom } = searchConfig;
    const { url } = scrapeFrom;
    const page = await browser.newPage();
    try {
        //go to page
        await page.goto(url);
        // await this.fillForm({page, keyword});
        // Check for existence of the no-results banner
        const noResults = await page.$('div.jobs-search-no-results-banner');
        if (noResults) {
            return { jobs: [], success: true, message: "No jobs found from this source", tool: "scraping", count: 0 };
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
        const jobs = await Promise.all(jobCards.map(async (jobCard) => {
            const textContent = await jobCard.$$eval('a, span, li', (elements) => elements
                .map((element) => element.textContent?.trim() || "")
                .filter((text) => text.length > 0));
            const link = await jobCard.$eval('a.job-card-container__link', (element) => element.href);
            return { textContent, link };
        }));
        return { jobs, success: true, count: jobs.length, tool: "scraping" };
    }
    catch (error) {
        const err = error;
        console.error("Error during LinkedIn audit:", error);
        return { jobs: [], success: false, error: err.message, tool: "scraping" };
    }
    finally {
        await page.close();
    }
}
