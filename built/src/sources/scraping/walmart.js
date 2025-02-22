"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = search;
const utils_1 = require("../../lib/utils");
async function search(browser, keyword) {
    const page = await browser.newPage();
    try {
        //go to page, prefill with query params
        await page.goto(`https://careers.walmart.com/results?q=${encodeURIComponent(keyword)}&page=1&sort=rank&jobCategory=00000161-8bda-d3dd-a1fd-bbda62130000&expand=department,00000159-7585-d286-a3f9-7fa533590000,00000159-7589-d286-a3f9-7fa968750000,00000159-758d-d286-a3f9-7fad37a00000,0000015e-b97d-d143-af5e-bd7da8ca0000,00000159-7574-d286-a3f9-7ff45f640000,brand,type,rate&type=jobs`);
        // await this.fillForm({page, keyword});
        // Check for existence of the no-results banner
        const noResultsElement = await page.$("div.search__no-results");
        const noResults = noResultsElement ? await page.evaluate(element => {
            return window.getComputedStyle(element).display !== 'none';
        }, noResultsElement) : false;
        if (noResults) {
            return { rawJobs: [], success: true, message: "No jobs found from this source" };
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
        const rawJobs = await Promise.all(jobCards.map(async (jobCard) => {
            const textContent = await jobCard.$$eval('a, span', (elements) => elements
                .map((element) => element.textContent?.trim() || "")
                .filter((text) => text.length > 0));
            const link = await jobCard.$eval("h4.job-listing__title a", (element) => element.href);
            return { textContent, link };
        }));
        return { rawJobs, success: true, count: rawJobs.length };
    }
    catch (error) {
        const err = error;
        console.error("Error during Walmart audit:", error);
        return { rawJobs: [], success: false, error: err.message };
    }
    finally {
        await page.close();
    }
}
