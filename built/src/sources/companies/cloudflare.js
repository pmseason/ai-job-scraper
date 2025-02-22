"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudflareAudit = void 0;
const cloudflare_1 = require("../scraping/cloudflare");
const cloudflare_2 = require("../firecrawl/cloudflare");
const gpt_1 = require("../../lib/openai/gpt");
class CloudflareAudit {
    async audit(input) {
        const { browser, searches } = input;
        const searchResults = [];
        const finalResults = [];
        for (const searchConfig of searches) {
            const data = await this.helper(browser, searchConfig);
            if ('rawJobs' in data) {
                searchResults.push(data);
                console.log("AI filtering for Cloudflare");
                const processed = await (0, gpt_1.filterJobs)(data);
                finalResults.push(processed);
            }
            else {
                finalResults.push(data);
            }
        }
        return { searchResults, finalResults };
    }
    async helper(browser, searchConfig) {
        const { source } = searchConfig;
        if (source === "scraping") {
            const { roleType } = searchConfig;
            console.log("Scraping Cloudflare on roletype: ", roleType);
            const data = await (0, cloudflare_1.scrape)(browser);
            return { ...data, searchConfig };
        }
        else if (source === "firecrawl") {
            const { url, searchQuery, roleType } = searchConfig;
            console.log("Firecrawl Cloudflare on search query and roletype: ", searchQuery, roleType);
            const data = await (0, cloudflare_2.firecrawl)(url, searchQuery);
            return { ...data, searchConfig };
        }
        else if (source === "api") {
            return { rawJobs: [], message: "API search not implemented", success: false, searchConfig, count: 0 };
        }
    }
}
exports.CloudflareAudit = CloudflareAudit;
