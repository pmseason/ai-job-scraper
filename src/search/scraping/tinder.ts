import {  SearchInput, SearchResult } from "../../types/audit.type"; // Update the import path as needed
import { delay } from "../../lib/utils";

export async function scrape(input: SearchInput): Promise<SearchResult> {
    const { browser, searchConfig } = input;
    const { scrapeFrom } = searchConfig;
    const { url } = scrapeFrom;
    const page = await browser.newPage();

    try {
        //go to url, no prefilling data
        await page.goto(url);

        //not working rn
        const noJobsSelector = "div[class*=jetboost-list-wrapper-empty]";
        const noJobs = await page.$eval(noJobsSelector, (div) => {
            return !div.classList.contains('jetboost-list-item-hide')
        });
        if (noJobs) {
            return { jobs: [], success: true, count: 0, tool: "scraping" };
        }

        // Navigate through more positions (pagination)
        const morePositionsSelector = 'a[class*="jetboost-pagination-next-"]';
        for (let i = 0; i < 5; i++) {
            const loadMoreButton = await page.$(morePositionsSelector);
            if (!loadMoreButton) break;
            await page.evaluate((button) => {
                button.scrollIntoView({ behavior: 'smooth' });
            }, loadMoreButton);
            await loadMoreButton.click();
            await delay(1000);
        }

        // Wait for job cards to load
        const jobCardSelector = "div[role='list'].positions-grid div[role='listitem']";
        const jobCards = await page.$$(jobCardSelector);

        // Extract job data
        const jobs = await Promise.all(
            jobCards.map(async (jobCard) => {
                const textContent = await jobCard.$$eval(
                    "div",
                    (elements) =>
                        elements
                            .map((element) => element.textContent?.trim() || "")
                            .filter((text) => text.length > 0)
                );

                const link = await jobCard.$eval("a", (element) => element.href);
                return { textContent, link };
            })
        );

        return { jobs, success: true, count: jobs.length, tool: "scraping" };
    } catch (error) {
        const err = error as Error;
        console.error("Error during Tider audit:", error);
        return { jobs: [], success: false, error: err.message, count: 0, tool: "scraping" };
    } finally {
        await page.close();
    }
}
