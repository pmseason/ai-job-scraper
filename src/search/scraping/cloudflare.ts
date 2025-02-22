import { Browser, Page } from "puppeteer-core";
import { SearchInput, SearchResult } from "../../types/audit.type"; // Update the import path as needed
import { delay } from "../../lib/utils";

export async function scrape(input: SearchInput): Promise<SearchResult> {
    const { browser, searchConfig } = input;
    const { scrapeFrom } = searchConfig;
    const { url } = scrapeFrom;
    const page = await browser.newPage();

    try {

        //go to page, no search
        await page.goto(url);

        // TODO: Check for existence of the no-results banner
        const jobListSelector = "div#jobs-list";
        const jobList = await page.$(jobListSelector);
        if (jobList) {
            const childCount = await page.evaluate((jobList) => jobList.childElementCount, jobList);
            if (childCount === 1) {
                return { jobs: [], success: true, message: "No jobs found from this source", tool: "scraping", count: 0 };
            }
        }

        //scroll so we can see whats going on
        await page.evaluate(async () => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        });
        await delay(1000);


        // no pagination - they dont have any!!!

        //find all job cards and store in variable
        const jobCardSelector = "div#jobs-list > div:not(:first-child)";
        const jobCards = await page.$$(jobCardSelector);

        // Extract text content and link from each job card
        const jobs = await Promise.all(
            jobCards.map(async (jobCard) => {
                const textContent = await jobCard.$$eval(
                    'a, p, span',
                    (elements) =>
                        elements
                            .map((element) => element.textContent?.trim() || "")
                            .filter((text) => text.length > 0)
                );
                const link = await jobCard.$eval("a", (element) => element.href);
                return { textContent, link }
            })
        );

        return { jobs, success: true, count: jobs.length, tool: "scraping" };
    } catch (error) {
        const err = error as Error;
        console.error("Error during Cloudflare audit:", error);
        return { jobs: [], success: false, error: err.message, count: 0, tool: "scraping" };
    } finally {
        await page.close();
    }
}
