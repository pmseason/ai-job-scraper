"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrape = scrape;
const utils_1 = require("../../lib/utils");
async function scrape(browser) {
    const page = await browser.newPage();
    try {
        //go to page, no search
        //they have api also
        await page.goto(`https://www.cloudflare.com/careers/jobs/?department=Product`);
        // TODO: Check for existence of the no-results banner
        const jobListSelector = "div#jobs-list";
        const jobList = await page.$(jobListSelector);
        if (jobList) {
            const childCount = await page.evaluate((jobList) => jobList.childElementCount, jobList);
            if (childCount === 1) {
                return { rawJobs: [], success: true, message: "No jobs found from this source" };
            }
        }
        //scroll so we can see whats going on
        await page.evaluate(async () => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        });
        await (0, utils_1.delay)(1000);
        // no pagination - they dont have any!!!
        //find all job cards and store in variable
        const jobCardSelector = "div#jobs-list > div:not(:first-child)";
        const jobCards = await page.$$(jobCardSelector);
        // Extract text content and link from each job card
        const rawJobs = await Promise.all(jobCards.map(async (jobCard) => {
            const textContent = await jobCard.$$eval('a, p, span', (elements) => elements
                .map((element) => element.textContent?.trim() || "")
                .filter((text) => text.length > 0));
            const link = await jobCard.$eval("a", (element) => element.href);
            return { textContent, link };
        }));
        return { rawJobs, success: true, count: rawJobs.length };
    }
    catch (error) {
        const err = error;
        console.error("Error during Cloudflare audit:", error);
        return { rawJobs: [], success: false, error: err.message, count: 0 };
    }
    finally {
        await page.close();
    }
}
