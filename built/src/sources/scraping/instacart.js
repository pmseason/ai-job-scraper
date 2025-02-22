"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = search;
const utils_1 = require("../../lib/utils");
async function search(browser, keyword) {
    const page = await browser.newPage();
    try {
        //go to page, no in query params possible
        await page.goto(`https://instacart.careers/current-openings/`);
        await fillForm({ page, keyword });
        // TODO: Check for existence of the no-results banner
        const noResults = await page.$('div.no-result-found');
        if (noResults) {
            return { rawJobs: [], success: true, message: "No jobs found from this source" };
        }
        await (0, utils_1.delay)(1000);
        // pagination - they dont have any!!!
        //find all job cards and store in variable
        const jobCardSelector = "div.accordion div.card-body div.jobs-section";
        const jobCards = await page.$$(jobCardSelector);
        // Extract text content and link from each job card
        const rawJobs = await Promise.all(jobCards.map(async (jobCard) => {
            const textContent = await jobCard.$$eval('a, span', (elements) => elements
                .map((element) => element.textContent?.trim() || "")
                .filter((text) => text.length > 0));
            const link = await jobCard.$eval("a", (element) => element.href);
            return { textContent, link };
        }));
        return { rawJobs, success: true, count: rawJobs.length };
    }
    catch (error) {
        const err = error;
        console.error("Error during Instacart audit:", error);
        return { rawJobs: [], success: false, error: err.message };
    }
    finally {
        await page.close();
    }
}
async function fillForm(input) {
    const { page, keyword } = input;
    const searchInputSelector = "div.jobs-search input#jobs-search-dept";
    const search = await page.$(searchInputSelector);
    await page.evaluate((element) => {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
    }, search);
    await page.locator(searchInputSelector).fill(keyword);
    await page.keyboard.press("Enter");
}
