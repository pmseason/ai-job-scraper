import { Browser, ElementHandle, Page } from "puppeteer-core";
import { SearchInput, SearchResult } from "../../types/audit.type"; // Update the import path as needed
import { delay } from "../../lib/utils";

export async function scrape(input: SearchInput): Promise<SearchResult> {
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

        await delay(1000);


        // handle pagination
        const nextPageSelector = "ul.search__results__pagination button[data-page=next]";
        const jobCardSelector = "div.search__results ul#search-results li.search-result";
        const jobCards: ElementHandle<HTMLElement>[] = [];

        for (let i = 0; i < 5; i++) {
            const temp = await page.$$(jobCardSelector);
            jobCards.push(...temp);
            const nextPageButton = await page.$(nextPageSelector);
            if (!nextPageButton) break;
            await page.evaluate((button) => {
                button.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, nextPageButton);
            await nextPageButton.click();
            await delay(1000);
        }

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
                const link = await jobCard.$eval("h4.job-listing__title a", (element) => element.href);
                return { textContent, link }
            })
        );

        return { jobs, success: true, count: jobs.length, tool: "scraping" };

    } catch (error) {
        const err = error as Error;
        console.error("Error during Walmart audit:", error);
        return { jobs: [], success: false, error: err.message, tool: 'scraping' };
    } finally {
        await page.close();
    }
}
