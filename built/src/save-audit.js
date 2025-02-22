"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveResults = saveResults;
const fs = __importStar(require("fs"));
const csv = __importStar(require("fast-csv"));
const promises_1 = require("fs/promises");
async function ensureFilesExist() {
    // Ensure the results folder exists
    if (!fs.existsSync('results')) {
        fs.mkdirSync('results');
    }
    //make sure files exist
    if (!fs.existsSync('results/results.json')) {
        fs.writeFileSync('results/results.json', '[]', 'utf-8');
    }
    if (!fs.existsSync('results/results.csv')) {
        fs.writeFileSync('results/results.csv', '', 'utf-8');
    }
    if (!fs.existsSync('results/raw-results.json')) {
        fs.writeFileSync('results/raw-results.json', '[]', 'utf-8');
    }
}
async function mergeResults(newResults) {
    //ensure files r there
    await ensureFilesExist();
    //read all current data
    let fileContent = await (0, promises_1.readFile)('results/raw-results.json', 'utf-8');
    const rawResults = fileContent.trim() ? JSON.parse(fileContent) : [];
    fileContent = await (0, promises_1.readFile)('results/results.json', 'utf-8');
    const currentResults = fileContent.trim() ? JSON.parse(fileContent) : [];
    const allCurrentResults = [...rawResults, ...currentResults];
    //merge results
    const results = [...newResults];
    const companies = new Set();
    newResults.forEach((result) => companies.add(result.searchConfig.company));
    results.push(...allCurrentResults.filter((result) => !companies.has(result.searchConfig.company)));
    return results;
}
async function saveResults(newResults) {
    //merge with current results
    const results = await mergeResults(newResults);
    const rawResults = results.filter((result) => result.source === "scraping");
    const finalResults = results.filter((result) => result.source !== "scraping");
    //format for csv
    const csvResults = [];
    for (const result of finalResults) {
        const { searchConfig, jobs, timestamp } = result;
        const { source: searchSource, company, roleType } = searchConfig;
        const entries = jobs.map((job) => {
            const { title, application_link, location, description, other } = job;
            return { timestamp, company, title, application_link, location, description, other, roleType, searchSource, searchConfig: JSON.stringify(searchConfig) };
        });
        csvResults.push(...entries);
    }
    csvResults.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    //save to json
    await (0, promises_1.writeFile)('results/results.json', JSON.stringify(finalResults, null, 2));
    await (0, promises_1.writeFile)('results/raw-results.json', JSON.stringify(rawResults, null, 2));
    console.log("Audit results written to results.json");
    //format and save
    const csvStream = csv.format({ headers: true });
    const writableStream = fs.createWriteStream('results/results.csv');
    csvStream.pipe(writableStream);
    for (const row of csvResults) {
        csvStream.write(row);
    }
    csvStream.end();
    console.log("Audit results written to results.csv");
}
