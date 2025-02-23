"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firecrawl = firecrawl;
const zod_1 = require("zod");
const client_1 = require("./client");
async function firecrawl(searchInput) {
    const { searchConfig } = searchInput;
    const { scrapeFrom, aiQuery, roleType } = searchConfig;
    console.log(`Starting FIRECRAWL search on ${scrapeFrom.name}`);
    // const prompt = customQuery ? customQuery :
    //     `Extract all job positions related to ${searchQuery}. Include title and application link as required fields. Optionally include location, salary, visa, and description if available. Search across the first 3 pages of the site if possible.`
    const schema = zod_1.z.object({
        positions: zod_1.z.array(zod_1.z.object({
            title: zod_1.z.string(),
            application_link: zod_1.z.string(),
            location: zod_1.z.string().optional(),
            other: zod_1.z.string().optional(),
            description: zod_1.z.string().optional()
        }))
    });
    const response = await client_1.app.extract([
        `${scrapeFrom.url}`
    ], {
        prompt: aiQuery,
        schema,
    });
    const jobs = 'data' in response ? response.data.positions : [];
    const data = {
        jobs,
        success: true,
        count: jobs.length,
        tool: "firecrawl"
    };
    return data;
}
