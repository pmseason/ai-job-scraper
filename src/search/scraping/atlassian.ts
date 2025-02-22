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

        //scroll so we can see whats going on
        await page.evaluate(async () => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        });
        await delay(1000);


        // handle pagination - they dont have any!!!

        //find all job cards and store in variable
        const jobCardSelector = "div.careers div.search ~ div tr:not(:has(th))";
        const jobCards = await page.$$(jobCardSelector);

        // Extract text content and link from each job card
        const jobs = await Promise.all(
            jobCards.map(async (jobCard) => {
                const textContent = await jobCard.$$eval(
                    'a, td',
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
        console.error("Error during Atlassian audit:", error);
        return { jobs: [], success: false, error: err.message, tool: "scraping", count: 0 };
    } finally {
        await page.close();
    }
}
