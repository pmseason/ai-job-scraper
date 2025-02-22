"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = search;
const utils_1 = require("../../lib/utils");
async function search(browser, roleType) {
    const page = await browser.newPage();
    try {
        //go to page, no search
        //they have api also
        await page.goto(roleType == "apm" ? `https://www.atlassian.com/company/careers/all-jobs?team=Graduates&location=United%20States&search=` : `https://www.atlassian.com/company/careers/all-jobs?team=Interns&location=United%20States&search=`);
        // await this.fillForm({page, keyword});
        // TODO: Check for existence of the no-results banner
        //scroll so we can see whats going on
        await page.evaluate(async () => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        });
        await (0, utils_1.delay)(1000);
        // handle pagination - they dont have any!!!
        //find all job cards and store in variable
        const jobCardSelector = "div.careers div.search ~ div tr:not(:has(th))";
        const jobCards = await page.$$(jobCardSelector);
        // Extract text content and link from each job card
        const rawJobs = await Promise.all(jobCards.map(async (jobCard) => {
            const textContent = await jobCard.$$eval('a, td', (elements) => elements
                .map((element) => element.textContent?.trim() || "")
                .filter((text) => text.length > 0));
            const link = await jobCard.$eval("a", (element) => element.href);
            return { textContent, link };
        }));
        return { rawJobs, success: true, count: rawJobs.length };
    }
    catch (error) {
        const err = error;
        console.error("Error during Atlassian audit:", error);
        return { rawJobs: [], success: false, error: err.message };
    }
    finally {
        await page.close();
    }
}
