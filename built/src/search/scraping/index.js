"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrape = scrape;
const atlassian_1 = require("./atlassian");
const cloudflare_1 = require("./cloudflare");
const figma_1 = require("./figma");
const instacart_1 = require("./instacart");
const kpcb_1 = require("./kpcb");
const linkedin_1 = require("./linkedin");
const spotify_1 = require("./spotify");
const tinder_1 = require("./tinder");
const walmart_1 = require("./walmart");
const yahoo_1 = require("./yahoo");
async function scrape(input) {
    const { searchConfig, browser } = input;
    const { company, roleType, keyword } = searchConfig;
    console.log(`Starting SCRAPE on ${company} for ${roleType} roles with keyword: ${keyword}`);
    if (company == "atlassian") {
        return await (0, atlassian_1.scrape)(browser, roleType);
    }
    else if (company == "cloudflare") {
        return await (0, cloudflare_1.scrape)(browser);
    }
    else if (company == "figma") {
        return await (0, figma_1.scrape)(browser);
    }
    else if (company == "instacart") {
        return await (0, instacart_1.scrape)(browser, keyword);
    }
    else if (company == "kpcb") {
        return await (0, kpcb_1.scrape)(browser);
    }
    else if (company == "linkedin") {
        return await (0, linkedin_1.scrape)(browser, keyword);
    }
    else if (company == "spotify") {
        return await (0, spotify_1.scrape)(browser, roleType);
    }
    else if (company == "tinder") {
        return await (0, tinder_1.scrape)(browser, keyword, roleType);
    }
    else if (company == "walmart") {
        return await (0, walmart_1.scrape)(browser, keyword);
    }
    else if (company == "yahoo") {
        return await (0, yahoo_1.scrape)(browser, keyword);
    }
}
