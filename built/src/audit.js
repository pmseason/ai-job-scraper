"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const search_1 = require("./search");
const save_audit_1 = require("./save-audit");
async function runAudit(browser) {
    const results = [];
    const jobQueue = createJobQueue(config_1.auditConfig, 3);
    const timestamp = new Date().toISOString();
    for (const jobSet of jobQueue) {
        await Promise.all(jobSet.map(async (searchConfig) => {
            const searchResults = await (0, search_1.search)({ searchConfig, browser, timestamp });
            results.push(...searchResults);
        }));
    }
    await (0, save_audit_1.saveResults)(results);
}
/**
 * @param [maxConcurrency=3] maximum number of concurrent jobs, defaults to 3
 * @returns jobQueue - a 2D array, where each element is an array of concurrent jobs that will be run together
 */
function createJobQueue(searchList, maxConcurrency = 3) {
    const jobQueue = [];
    let tempQueue = [];
    for (const searchConfig of searchList) {
        tempQueue.push(searchConfig);
        if (tempQueue.length === maxConcurrency) {
            jobQueue.push(tempQueue);
            tempQueue = [];
        }
    }
    if (tempQueue.length > 0) {
        jobQueue.push(tempQueue);
    }
    return jobQueue;
}
exports.default = runAudit;
