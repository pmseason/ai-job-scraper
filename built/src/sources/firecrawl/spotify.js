"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firecrawl = firecrawl;
const client_1 = require("../../lib/firecrawl/client");
async function firecrawl(url, searchQuery) {
    const response = await (0, client_1.aiCrawl)(url, searchQuery);
    const data = {
        jobs: 'data' in response ? response.data.positions : [],
        success: true,
        count: 'data' in response ? response.data.positions.length : 0
    };
    return data;
}
