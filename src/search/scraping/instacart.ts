
import {  Page } from "puppeteer-core";
import { SearchInput, SearchResult } from "../../types/audit.type"; // Update the import path as needed
import { delay } from "../../lib/utils";

export async function scrape(input: SearchInput): Promise<SearchResult> {
    const { browser, searchConfig } = input;
    const { scrapeFrom } = searchConfig;
    const { url } = scrapeFrom;
    const page = await browser.newPage();

    try {

        //go to page, no in query params possible
        await page.goto(url);

        // await fillForm({ page, keyword });

        // TODO: Check for existence of the no-results banner
        const noResults = await page.$('div.no-result-found');
        if (noResults) {
            return { jobs: [], success: true, message: "No jobs found from this source", tool: "scraping", count: 0 };
        }
        await delay(1000);


        // pagination - they dont have any!!!

        //find all job cards and store in variable
        const jobCardSelector = "div.accordion div.card div.collapse div.jobs-section";
        const jobCards = await page.$$(jobCardSelector);

        // Extract text content and link from each job card
        const jobs = await Promise.all(
            jobCards.map(async (jobCard) => {
                const textContent = await jobCard.$$eval(
                    'a, span',
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
        console.error("Error during Instacart audit:", error);
        return { jobs: [], success: false, error: err.message, count: 0, tool: "scraping" };
    } finally {
        await page.close();
    }
}

async function fillForm(input: { page: Page, keyword: string }) {
    const { page, keyword } = input
    const searchInputSelector = "div.jobs-search input#jobs-search-dept"
    const search = await page.$(searchInputSelector);
    await page.evaluate((element) => {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
    }, search);
    await page.locator(searchInputSelector).fill(keyword);
    await page.keyboard.press("Enter");
}
