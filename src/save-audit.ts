// import * as fs from 'fs';
// import * as csv from 'fast-csv';
// import { CSVSearchResult, Job, ProcessedJob, SearchResult } from './types/audit.type';
// import { readFile, writeFile } from 'fs/promises';


// async function ensureFilesExist() {
//     // Ensure the results folder exists
//     if (!fs.existsSync('results')) {
//         fs.mkdirSync('results');
//     }
//     //make sure files exist
//     if (!fs.existsSync('results/results.json')) {
//         fs.writeFileSync('results/results.json', '[]', 'utf-8');
//     }
//     if (!fs.existsSync('results/results.csv')) {
//         fs.writeFileSync('results/results.csv', '', 'utf-8');
//     }
//     if (!fs.existsSync('results/raw-results.json')) {
//         fs.writeFileSync('results/raw-results.json', '[]', 'utf-8');
//     }
// }

// async function mergeResults(newResults: SearchResult[]): Promise<SearchResult[]> {
//     //ensure files r there
//     await ensureFilesExist();

//     //read all current data
//     let fileContent = await readFile('results/raw-results.json', 'utf-8');
//     const rawResults: SearchResult[] = fileContent.trim() ? JSON.parse(fileContent) : [];
//     fileContent = await readFile('results/results.json', 'utf-8');
//     const currentResults: SearchResult[] = fileContent.trim() ? JSON.parse(fileContent) : [];
//     const allCurrentResults = [...rawResults, ...currentResults];

//     //merge results
//     const results: SearchResult[] = [...newResults];
//     const companies: Set<string> = new Set()
//     newResults.forEach((result: SearchResult) => companies.add(result.searchConfig.company));
//     results.push(...allCurrentResults.filter((result: SearchResult) => !companies.has(result.searchConfig.company)))

//     return results;
// }

// export async function saveResults(newResults: SearchResult[]) {
//     //merge with current results
//     const results = await mergeResults(newResults);

//     const rawResults = results.filter((result: SearchResult) => result.source === "scraping");
//     const finalResults = results.filter((result: SearchResult) => result.source !== "scraping");

//     //format for csv
//     const csvResults: CSVSearchResult[] = []
//     for (const result of finalResults) {
//         const { searchConfig, jobs, timestamp } = result
//         const { source: searchSource, company, roleType } = searchConfig
//         const entries = jobs.map((job: Job) => {
//             const { title, application_link, location, description, other } = job as ProcessedJob;
//             return { timestamp, company, title, application_link, location, description, other, roleType, searchSource, searchConfig: JSON.stringify(searchConfig) }
//         })
//         csvResults.push(...entries)
//     }
//     csvResults.sort((a: CSVSearchResult, b: CSVSearchResult) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

//     //save to json
//     await writeFile('results/results.json', JSON.stringify(finalResults, null, 2));
//     await writeFile('results/raw-results.json', JSON.stringify(rawResults, null, 2));
//     console.log("Audit results written to results.json");

//     //format and save
//     const csvStream = csv.format({ headers: true });
//     const writableStream = fs.createWriteStream('results/results.csv');
//     csvStream.pipe(writableStream);

//     for (const row of csvResults) {
//         csvStream.write(row);
//     }

//     csvStream.end();
//     console.log("Audit results written to results.csv");
// }