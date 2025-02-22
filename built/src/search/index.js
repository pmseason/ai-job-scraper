"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = search;
const firecrawler_1 = require("../lib/firecrawl/firecrawler");
const gpt_1 = require("../lib/openai/gpt");
const scraping_1 = require("./scraping");
async function search(input) {
    const { searchConfig, timestamp } = input;
    const { source } = searchConfig;
    if (source == "scraping+ai") {
        const scrapingResult = await (0, scraping_1.scrape)(input);
        const processedResult = await (0, gpt_1.filterJobs)({ ...scrapingResult, searchConfig });
        return [{ ...processedResult, searchConfig, timestamp }, { ...scrapingResult, searchConfig, timestamp }];
    }
    else {
        const firecrawlResult = await (0, firecrawler_1.firecrawl)(searchConfig);
        return [{ ...firecrawlResult, searchConfig, timestamp }];
    }
}
