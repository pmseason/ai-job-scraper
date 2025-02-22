import { SearchInput, SearchResult } from "../types/audit.type";
import { firecrawl } from "../lib/firecrawl/firecrawler";
import { filterJobs } from "../lib/openai/gpt";
import { scrape, getSupportedSources } from "./scraping";


const supportedSources = getSupportedSources();

export async function search(input: SearchInput): Promise<SearchResult[]> {
    const { searchConfig, timestamp } = input;
    const { scrapeFrom } = searchConfig;
    const isSupported = supportedSources.find(source => source.name === scrapeFrom.name && source.url === scrapeFrom.url);
    if (!isSupported) {
        const firecrawlResult = await firecrawl(input);
        return [{...firecrawlResult, timestamp, searchConfig}];
    } else {
        const scrapingResult = await scrape(input);
        const filteredScrapingResult = await filterJobs({...scrapingResult, searchConfig});
        return [{...filteredScrapingResult, timestamp, searchConfig}, {...scrapingResult, timestamp, searchConfig}];
    }
    
}