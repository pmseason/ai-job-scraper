"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const axios_1 = __importDefault(require("axios"));
const search_1 = require("./search");
const fs = require('fs');
async function setupBrowser(chromeUrl) {
    // const response = await axios.get("http://localhost:9222/json/version");
    const response = await axios_1.default.get(`${chromeUrl}/json/version`);
    const { webSocketDebuggerUrl } = response.data;
    const browser = await puppeteer_core_1.default.connect({
        browserWSEndpoint: webSocketDebuggerUrl,
        defaultViewport: { width: 1440, height: 900 },
    });
    return browser;
}
async function runAudit(browser, searchConfigs) {
    const results = [];
    const jobQueue = createJobQueue(searchConfigs, 3);
    const timestamp = new Date().toISOString();
    for (const jobSet of jobQueue) {
        await Promise.all(jobSet.map(async (searchConfig) => {
            const searchResults = await (0, search_1.search)({ searchConfig, browser, timestamp });
            results.push(...searchResults);
        }));
    }
    return results;
}
/**
 * @param [maxConcurrency=3] maximum number of concurrent jobs, defaults to 3
 * @returns jobQueue - a 2D array, where each element is an array of concurrent jobs that will be run together
 */
function createJobQueue(searchList, maxConcurrency = 3) {
    const jobQueue = [];
    let tempQueue = [];
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
async function main(searchConfigs, chromeUrl) {
    const browser = await setupBrowser(chromeUrl);
    const results = await runAudit(browser, searchConfigs);
    fs.writeFileSync('e.json', JSON.stringify(results, null, 2));
    browser.disconnect();
    return results;
}
const c = [{
        scrapeFrom: {
            name: "cloudflare",
            url: "https://www.cloudflare.com/careers/jobs/?department=Product"
        },
        roleType: "apm",
        aiQuery: "Job must be for Product Manager roles",
    }];
const url = "http://localhost:9222";
main(c, url).then(console.log).catch(console.error);
