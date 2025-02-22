"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedinAudit = void 0;
const linkedin_1 = require("../scraping/linkedin");
const gpt_1 = require("../../lib/openai/gpt");
class LinkedinAudit {
    async audit(input) {
        const { browser, searches } = input;
        const searchResults = [];
        const finalResults = [];
        for (const searchConfig of searches) {
            const data = await this.helper(browser, searchConfig);
            if ('rawJobs' in data) {
                searchResults.push(data);
                console.log("AI filtering for LinkedIn");
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
            const { keyword, roleType } = searchConfig;
            console.log("Scraping Linkedin on keyword and roletype: ", keyword, roleType);
            const data = await (0, linkedin_1.search)(browser, keyword);
            return { ...data, searchConfig };
        }
        else if (source === "firecrawl") {
            return { rawJobs: [], message: "Firecrawl not implemented", success: false, searchConfig, count: 0 };
        }
        else if (source === "api") {
            return { rawJobs: [], message: "API search not implemented", success: false, searchConfig, count: 0 };
        }
    }
}
exports.LinkedinAudit = LinkedinAudit;
