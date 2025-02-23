"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = search;
const firecrawler_1 = require("../lib/firecrawl/firecrawler");
const gpt_1 = require("../lib/openai/gpt");
const scraping_1 = require("./scraping");
const supportedSources = (0, scraping_1.getSupportedSources)();
async function search(input) {
    const { searchConfig, timestamp } = input;
    const { scrapeFrom } = searchConfig;
    const isSupported = supportedSources.find(source => source.name === scrapeFrom.name && scrapeFrom.url.startsWith(source.url));
    if (!isSupported) {
        const firecrawlResult = await (0, firecrawler_1.firecrawl)(input);
        return [{ ...firecrawlResult, timestamp, searchConfig }];
    }
    else {
        const scrapingResult = await (0, scraping_1.scrape)(input);
        const filteredScrapingResult = await (0, gpt_1.filterJobs)({ ...scrapingResult, searchConfig });
        return [{ ...filteredScrapingResult, timestamp, searchConfig }, { ...scrapingResult, timestamp, searchConfig }];
    }
}
