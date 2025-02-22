import { z } from "zod";
import { app } from "./client";
import { SearchSource } from "../../types/config.type";
import { SearchInput, SearchResult, SearchTool } from "../../types/audit.type";

export async function firecrawl(searchInput: SearchInput): Promise<SearchResult> {
    const { searchConfig } = searchInput;
    const { scrapeFrom, aiQuery, roleType } = searchConfig;
    console.log(`Starting FIRECRAWL search on ${scrapeFrom.name}`)

    // const prompt = customQuery ? customQuery :
    //     `Extract all job positions related to ${searchQuery}. Include title and application link as required fields. Optionally include location, salary, visa, and description if available. Search across the first 3 pages of the site if possible.`


    const schema = z.object({
        positions: z.array(z.object({
            title: z.string(),
            application_link: z.string(),
            location: z.string().optional(),
            other: z.string().optional(),
            description: z.string().optional()
        }))
    });
    const response = await app.extract([
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
        tool: "firecrawl" as SearchTool
    }

    return data;
}
