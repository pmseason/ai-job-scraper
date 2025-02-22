"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeslaAudit = void 0;
const uipath_1 = require("../firecrawl/uipath");
const gpt_1 = require("../../lib/openai/gpt");
class TeslaAudit {
    async audit(input) {
        const { browser, searches } = input;
        const searchResults = [];
        const finalResults = [];
        for (const searchConfig of searches) {
            const data = await this.helper(browser, searchConfig);
            if ('rawJobs' in data) {
                searchResults.push(data);
                console.log("AI filtering for Tesla");
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
            return { rawJobs: [], message: "Scraping not implemented", success: false, searchConfig, count: 0 };
        }
        else if (source === "firecrawl") {
            const { url, searchQuery, roleType } = searchConfig;
            console.log("Firecrawl for Tesla on search query and roletype: ", searchQuery, roleType);
            const data = await (0, uipath_1.firecrawl)(url, searchQuery);
            return { ...data, searchConfig };
        }
        else if (source === "api") {
            return { rawJobs: [], message: "API search not implemented", success: false, searchConfig, count: 0 };
        }
    }
}
exports.TeslaAudit = TeslaAudit;
