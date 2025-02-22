import { client } from "./client";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { Job, ProcessedJob, SearchResult } from "../../types/audit.type";

const JobSchema = z.object({
  jobs: z.array(z.object({
    title: z.string(),
    application_link: z.string(),
    location: z.string().optional(),
    description: z.string().optional(),
    other: z.string().optional(),
  }))
});

// function buildConditions(roleType: RoleType, aiQueries: string[]) {
//   const baseConditions = [
//     "Job CANNOT have 'senior' or any other word that implies more experience. We are looking for " +
//     (roleType === "apm"
//       ? "New Grad, Junior, Associate, and Entry Level roles."
//       : "Internship and Fellowship roles."),
//     "Job MUST be located Remote or in the United States of America.",
//   ];

//   const queryConditions = aiQueries.map((query) => `- ${query}`);
//   return [...queryConditions, ...baseConditions].join("\n");
// }




export async function filterJobs(searchResult: SearchResult): Promise<SearchResult> {
  const { jobs, searchConfig } = searchResult;
  console.log(`Starting AI FILTER for jobs from ${searchConfig.scrapeFrom.name}`)

  const { roleType, aiQuery } = searchConfig;
  const CHUNK_SIZE = 10; // Adjust based on expected token size per job
  const chunks: Job[][] = [];
  const validJobs: ProcessedJob[] = [];

  // Split the jobs into smaller chunks
  for (let i = 0; i < jobs.length; i += CHUNK_SIZE) {
    chunks.push(jobs.slice(i, i + CHUNK_SIZE));
  }

  for (const chunk of chunks) {
    const userInput = { rawJobs: chunk };
    const completion = await client.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          // content: `You are an expert at structured data extraction. You will be given unstructured data from a job site \
          //         audit and should filter it and convert it into the given structure. Here is the criteria for a valid job: \
          //           ${buildConditions(roleType, jobConditions)}`,
          content: aiQuery,
        },
        { role: "user", content: JSON.stringify(userInput) },
      ],
      response_format: zodResponseFormat(JobSchema, "job_schema"),
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
    tool: "scraping+ai"
  };
}




