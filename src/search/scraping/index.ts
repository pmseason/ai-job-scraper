import { SearchSource } from "@/src/types/config.type";
import { SearchInput, SearchResult } from "../../types/audit.type";
import { scrape as atlassianScrape } from "./atlassian";
import { scrape as cloudflareScrape } from "./cloudflare";
import { scrape as figmaScrape } from "./figma";
import { scrape as instacartScrape } from "./instacart";
import { scrape as kpcbScrape } from "./kpcb";
import { scrape as linkedinScrape } from "./linkedin";
import { scrape as spotifyScrape } from "./spotify";
import { scrape as tinderScrape } from "./tinder";
import { scrape as walmartScrape } from "./walmart";
import { scrape as yahooScrape } from "./yahoo";


export async function scrape(input: SearchInput): Promise<SearchResult> {
    const { searchConfig, browser } = input;
    const { roleType, scrapeFrom } = searchConfig;
    const { name } = scrapeFrom;

    console.log(`Starting SCRAPE on ${name} for ${roleType}`);

    if (name == "atlassian") {
        return await atlassianScrape(input);
    } else if (name == "cloudflare") {
        return await cloudflareScrape(input);
    } else if (name == "figma") {
        return await figmaScrape(input)
    } else if (name == "instacart") {
        return await instacartScrape(input)
    } else if (name == "kpcb") {
        return await kpcbScrape(input)
    } else if (name == "linkedin") {
        return await linkedinScrape(input)
    } else if (name == "spotify") {
        return await spotifyScrape(input)
    } else if (name == "tinder") {
        return await tinderScrape(input)
    } else if (name == "walmart") {
        return await walmartScrape(input)
    } else if (name == "yahoo") {
        return await yahooScrape(input)
    }
}

export function getSupportedSources(): SearchSource[] {
    return [
        { name: "atlassian", url: "https://www.atlassian.com/company/careers/all-jobs" },
        { name: "cloudflare", url: "https://www.cloudflare.com/careers/jobs/" },
        { name: "figma", url: "https://www.figma.com/careers/#job-openings" },
        { name: "instacart", url: "https://instacart.careers/current-openings/" },
        { name: "kpcb", url: "https://jobs.ashbyhq.com/kleinerperkinsfellows" },
        { name: "linkedin", url: "https://www.linkedin.com/jobs/search/" },
        { name: "spotify", url: "hhttps://www.lifeatspotify.com/jobs" },
        { name: "tinder", url: "https://www.lifeattinder.com/" },
        { name: "walmart", url: "https://careers.walmart.com/results" },
        { name: "yahoo", url: "ttps://www.yahooinc.com/careers/search.html" }
    ];
}