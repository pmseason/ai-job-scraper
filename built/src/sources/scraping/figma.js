"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = search;
async function search(browser) {
    const page = await browser.newPage();
    try {
        //go to page, no in query params possible
        await page.goto(`https://www.figma.com/careers/#job-openings`);
        // they dont have no results, or search!!!
        // pagination - they dont have any!!!
        const jobSectionSelector = "section#job-openings";
        await (await page.$(jobSectionSelector)).scrollIntoView();
        //find all job cards and store in variable
        const jobCardSelector = "ul[aria-labelledby=product] > li";
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
        console.error("Error during Figma audit:", error);
        return { rawJobs: [], success: false, error: err.message, count: 0 };
    }
    finally {
        await page.close();
    }
}
