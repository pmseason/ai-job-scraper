"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = search;
const utils_1 = require("../../lib/utils");
async function search(browser, roleType) {
    const page = await browser.newPage();
    try {
        //go to page, no keywords or search!!
        await page.goto(roleType == "apm" ? `https://www.lifeatspotify.com/jobs?c=product&l=new-york&l=los-angeles&l=boston&l=detroit` : `https://www.lifeatspotify.com/jobs?c=product&c=students&l=boston&l=los-angeles&l=new-york`);
        // Check for existence of the no-results banner
        const noResults = await page.$("div.container div.row div[class*='noresult']");
        if (noResults) {
            return { rawJobs: [], success: true, message: "No jobs found from this source" };
        }
        await (0, utils_1.delay)(1000);
        // handle pagination
        const loadMoreButtonSelector = "button[aria-label='Load more jobs']";
        for (let i = 0; i < 5; i++) {
            const loadMoreButton = await page.$(loadMoreButtonSelector);
            if (!loadMoreButton)
                break;
            await page.evaluate((selector) => {
                document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
            }, loadMoreButtonSelector);
            await loadMoreButton.click();
            await (0, utils_1.delay)(1000);
        }
        //find all job cards and store in variable
        const jobCardSelector = "div.container div.row div[data-item=true][class*='entry_container']";
        const jobCards = await page.$$(jobCardSelector);
        // Extract text content and link from each job card
        const rawJobs = await Promise.all(jobCards.map(async (jobCard) => {
            const textContent = await jobCard.$$eval('a, p', (elements) => elements
                .map((element) => element.textContent?.trim() || "")
                .filter((text) => text.length > 0));
            const link = await jobCard.$eval("div[class*='entry_header'] a", (element) => element.href);
            return { textContent, link };
        }));
        return { rawJobs, success: true, count: rawJobs.length };
    }
    catch (error) {
        const err = error;
        console.error("Error during Spotify audit:", error);
        return { rawJobs: [], success: false, error: err.message, count: 0 };
    }
    finally {
        await page.close();
    }
}
