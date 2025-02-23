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
        //go to page, prefill with query params
        await page.goto(url);
        // await this.fillForm({page, keyword});
        // Check for existence of the no-results banner
        const noResultsElement = await page.$("div.search__no-results");
        const noResults = noResultsElement ? await page.evaluate(element => {
            return window.getComputedStyle(element).display !== 'none';
        }, noResultsElement) : false;
        if (noResults) {
            return { jobs: [], success: true, message: "No jobs found from this source", tool: "scraping" };
        }
        await (0, utils_1.delay)(1000);
        // handle pagination
        const nextPageSelector = "ul.search__results__pagination button[data-page=next]";
        const jobCardSelector = "div.search__results ul#search-results li.search-result";
        const jobCards = [];
        for (let i = 0; i < 5; i++) {
            const temp = await page.$$(jobCardSelector);
            jobCards.push(...temp);
            const nextPageButton = await page.$(nextPageSelector);
            if (!nextPageButton)
                break;
            await page.evaluate((button) => {
                button.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, nextPageButton);
            await nextPageButton.click();
            await (0, utils_1.delay)(1000);
        }
        // Extract text content and link from each job card
        const jobs = await Promise.all(jobCards.map(async (jobCard) => {
            const textContent = await jobCard.$$eval('a, span', (elements) => elements
                .map((element) => element.textContent?.trim() || "")
                .filter((text) => text.length > 0));
            const link = await jobCard.$eval("h4.job-listing__title a", (element) => element.href);
            return { textContent, link };
        }));
        return { jobs, success: true, count: jobs.length, tool: "scraping" };
    }
    catch (error) {
        const err = error;
        console.error("Error during Walmart audit:", error);
        return { jobs: [], success: false, error: err.message, tool: 'scraping' };
    }
    finally {
        await page.close();
    }
}
