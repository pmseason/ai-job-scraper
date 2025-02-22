"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterJobs = filterJobs;
const client_1 = require("./client");
const zod_1 = require("zod");
const zod_2 = require("openai/helpers/zod");
const JobSchema = zod_1.z.object({
    jobs: zod_1.z.array(zod_1.z.object({
        title: zod_1.z.string(),
        application_link: zod_1.z.string(),
        location: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        other: zod_1.z.string().optional(),
    }))
});
function buildConditions(roleType, aiQueries) {
    const baseConditions = [
        "Job CANNOT have 'senior' or any other word that implies more experience. We are looking for " +
            (roleType === "apm"
                ? "New Grad, Junior, Associate, and Entry Level roles."
                : "Internship and Fellowship roles."),
        "Job MUST be located Remote or in the United States of America.",
    ];
    const queryConditions = aiQueries.map((query) => `- ${query}`);
    return [...queryConditions, ...baseConditions].join("\n");
}
async function filterJobs(searchResult) {
    const { jobs, searchConfig } = searchResult;
    console.log(`Starting AI FILTER for jobs from ${searchConfig.company} search`);
    const { roleType, jobConditions } = searchConfig;
    const CHUNK_SIZE = 10; // Adjust based on expected token size per job
    const chunks = [];
    const validJobs = [];
    // Split the jobs into smaller chunks
    for (let i = 0; i < jobs.length; i += CHUNK_SIZE) {
        chunks.push(jobs.slice(i, i + CHUNK_SIZE));
    }
    for (const chunk of chunks) {
        const userInput = { rawJobs: chunk };
        const completion = await client_1.client.beta.chat.completions.parse({
            model: "gpt-4o-2024-08-06",
            messages: [
                {
                    role: "system",
                    content: `You are an expert at structured data extraction. You will be given unstructured data from a job site \
                  audit and should filter it and convert it into the given structure. Here is the criteria for a valid job: \
                    ${buildConditions(roleType, jobConditions)}`,
                },
                { role: "user", content: JSON.stringify(userInput) },
            ],
            response_format: (0, zod_2.zodResponseFormat)(JobSchema, "job_schema"),
        });
        const response = completion.choices[0].message;
        if (response.parsed.jobs) {
            validJobs.push(...response.parsed.jobs);
        }
    }
    return {
        jobs: validJobs,
        success: true,
        searchConfig,
        count: validJobs.length,
        source: "scraping+ai"
    };
}
