"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrape = scrape;
exports.getSupportedSources = getSupportedSources;
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
    const { roleType, scrapeFrom } = searchConfig;
    const { name } = scrapeFrom;
    console.log(`Starting SCRAPE on ${name} for ${roleType}`);
    if (name == "atlassian") {
        return await (0, atlassian_1.scrape)(input);
    }
    else if (name == "cloudflare") {
        return await (0, cloudflare_1.scrape)(input);
    }
    else if (name == "figma") {
        return await (0, figma_1.scrape)(input);
    }
    else if (name == "instacart") {
        return await (0, instacart_1.scrape)(input);
    }
    else if (name == "kpcb") {
        return await (0, kpcb_1.scrape)(input);
    }
    else if (name == "linkedin") {
        return await (0, linkedin_1.scrape)(input);
    }
    else if (name == "spotify") {
        return await (0, spotify_1.scrape)(input);
    }
    else if (name == "tinder") {
        return await (0, tinder_1.scrape)(input);
    }
    else if (name == "walmart") {
        return await (0, walmart_1.scrape)(input);
    }
    else if (name == "yahoo") {
        return await (0, yahoo_1.scrape)(input);
    }
}
function getSupportedSources() {
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
