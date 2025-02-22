import {  SearchInput, SearchResult } from "../../types/audit.type"; // Update the import path as needed
import { delay } from "../../lib/utils";

export async function scrape(input: SearchInput): Promise<SearchResult> {
    const { browser, searchConfig } = input;
    const { scrapeFrom } = searchConfig;
    const { url } = scrapeFrom;
    const page = await browser.newPage();

    try {
        //go to page, no keywords or search!!
        await page.goto(url);

        // Check for existence of the no-results banner
        const noResults = await page.$("div.container div.row div[class*='noresult']");
        if (noResults) {
            return { jobs: [], success: true, message: "No jobs found from this source", tool: "scraping" };
        }

        await delay(1000);


        // handle pagination
        const loadMoreButtonSelector = "button[aria-label='Load more jobs']";
        for (let i = 0; i < 5; i++) {
            const loadMoreButton = await page.$(loadMoreButtonSelector);
            if (!loadMoreButton) break;
            await page.evaluate((selector) => {
                document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
            }, loadMoreButtonSelector);
            await loadMoreButton.click();
            await delay(1000);
        }

        //find all job cards and store in variable
        const jobCardSelector = "div.container div.row div[data-item=true][class*='entry_container']";
        const jobCards = await page.$$(jobCardSelector);

        // Extract text content and link from each job card
        const jobs = await Promise.all(
            jobCards.map(async (jobCard) => {
                const textContent = await jobCard.$$eval(
                    'a, p',
                    (elements) =>
                        elements
                            .map((element) => element.textContent?.trim() || "")
                            .filter((text) => text.length > 0)
                );
                const link = await jobCard.$eval("div[class*='entry_header'] a", (element) => element.href);
                return { textContent, link }
            })
        );

        return { jobs, success: true, count: jobs.length, tool: "scraping" };
    } catch (error) {
        const err = error as Error;
        console.error("Error during Spotify audit:", error);
        return { jobs: [], success: false, error: err.message, count: 0, tool: "scraping" };
    } finally {
        await page.close();
    }
}
