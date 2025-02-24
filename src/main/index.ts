import puppeteer from "puppeteer-core";
import axios from "axios";
import { Browser } from "puppeteer-core";
import { SearchConfig } from '../types/config.type';
import { SearchResult } from '../types/audit.type';
import { search } from '../search';

async function setupBrowser(chromeUrl: string): Promise<Browser> {
    // const response = await axios.get("http://localhost:9222/json/version");
    const response = await axios.get(`${chromeUrl}/json/version`);
    const { webSocketDebuggerUrl } = response.data;
    const browser = await puppeteer.connect({
        browserWSEndpoint: webSocketDebuggerUrl,
        defaultViewport: {width: 1440, height: 900},
    });

    return browser;
}


async function runAudit(browser: Browser, searchConfigs: SearchConfig[]): Promise<SearchResult[]> {
    const results: SearchResult[] = []
    const jobQueue = createJobQueue(searchConfigs, 3);
    const timestamp = new Date().toISOString();

    for (const jobSet of jobQueue) {
        await Promise.all(
            jobSet.map(async (searchConfig: SearchConfig) => {
                const searchResults = await search({ searchConfig, browser, timestamp })
                results.push(...searchResults);
            })
        )
    }

    return results;

}

/**
 * @param [maxConcurrency=3] maximum number of concurrent jobs, defaults to 3
 * @returns jobQueue - a 2D array, where each element is an array of concurrent jobs that will be run together
 */
function createJobQueue(searchList: SearchConfig[], maxConcurrency: number = 3): SearchConfig[][] {
    const jobQueue: SearchConfig[][] = [];
    let tempQueue: SearchConfig[] = [];
    for (const searchConfig of searchList) {
        tempQueue.push(searchConfig);
        if (tempQueue.length === maxConcurrency) {
            jobQueue.push(tempQueue);
            tempQueue = [];
        }
    }
    if (tempQueue.length > 0) {
        jobQueue.push(tempQueue);
    }
    return jobQueue;
}



export async function startAudit(searchConfigs: SearchConfig[], chromeUrl: string): Promise<SearchResult[]> {
    const browser = await setupBrowser(chromeUrl);

    const results = await runAudit(browser, searchConfigs);

    browser.disconnect()

    return results;
}

// const c: SearchConfig[] = [{
//     scrapeFrom: {
//         name: "cloudflare",
//         url: "https://www.cloudflare.com/careers/jobs/?department=Product"
//     },
//     roleType: "apm",
//     aiQuery: "Job must be for Product Manager roles",
// }]
// const url = "http://localhost:9222";
// main(c, url).then(console.log).catch(console.error);
