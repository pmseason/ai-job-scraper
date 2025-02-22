"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FigmaAudit = void 0;
const figma_1 = require("../scraping/figma");
const gpt_1 = require("../../lib/openai/gpt");
class FigmaAudit {
    async audit(input) {
        const { browser, searches } = input;
        const searchResults = [];
        const finalResults = [];
        for (const searchConfig of searches) {
            const data = await this.helper(browser, searchConfig);
            if ('rawJobs' in data) {
                searchResults.push(data);
                console.log("AI filtering for Figma");
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
            console.log("Scraping Figma on roletype: ", roleType);
            const data = await (0, figma_1.search)(browser);
            return { ...data, searchConfig };
        }
        else if (source === "firecrawl") {
            return { rawJobs: [], message: "Firecrawl not implemented for Figma", success: false, searchConfig, count: 0 };
        }
        else if (source === "api") {
            return { rawJobs: [], message: "API search not implemented for Figma", success: false, searchConfig, count: 0 };
        }
    }
}
exports.FigmaAudit = FigmaAudit;
