"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrape = scrape;
async function scrape(input) {
    const { browser, searchConfig } = input;
    const { scrapeFrom } = searchConfig;
    const { url } = scrapeFrom;
    const page = await browser.newPage();
    try {
        const rootUrl = 'https://jobs.ashbyhq.com';
        //go to page, no in query params possible
        await page.goto(url);
        // await this.fillForm({ page, keyword });
        // pagination - they dont have any!!!
        //find all job cards and store in variable
        const jobCardSelector = "div.ashby-job-posting-brief-list > a";
        const jobCards = await page.$$(jobCardSelector);
        // Extract text content and link from each job card
        const jobs = await Promise.all(jobCards.map(async (jobCard) => {
            const textContent = await jobCard.$$eval('h3, p', (elements) => elements
                .map((element) => element.textContent?.trim() || "")
                .filter((text) => text.length > 0));
            const path = await jobCard.evaluate((element) => element.getAttribute('href'));
            const link = `${rootUrl}${path}`;
            return { textContent, link };
        }));
        return { jobs, success: true, count: jobs.length, tool: "scraping" };
    }
    catch (error) {
        const err = error;
        console.error("Error during KPCB audit:", error);
        return { jobs: [], success: false, error: err.message, tool: "scraping", count: 0 };
    }
    finally {
        await page.close();
    }
}
