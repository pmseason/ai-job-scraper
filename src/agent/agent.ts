import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { z } from "zod";
import { setupBrowser } from "../main";
import { delay } from "../lib/utils";


// Define the tools for the agent to use
// const tools = [];
// const toolNode = new ToolNode(tools);

// Create a model and give it access to the tools
// const model = new ChatOpenAI({
//   model: "gpt-4o-mini",
//   temperature: 0,
// }).bindTools(tools);
const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0
});



export async function checkRoleOpen(url: string): Promise<boolean | undefined> {
    try {
        const browser = await setupBrowser();
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0' });
        await delay(5000)

        // Take a screenshot and convert to base64
        const base64Image = await page.screenshot({ encoding: "base64" });

        // Define the system instruction
        const system_prompt = `
        You are an expert working at a job posting website. Given the screenshot of a webpage for an application link, 
        determine if this role is open or closed. Use the context clues on the screen to evaluate whether applicants can still apply. 
        Respond with either True (if open) or False (if closed).
        `;

        // Define structured response schema (boolean)
        const OpenRoleSchema = z.object({
            isOpen: z.boolean()
        })

        // Construct messages for the LLM
        const messages = [
            new SystemMessage(system_prompt),
            new HumanMessage({
                content: [{
                    type: "image_url", image_url: {
                        url: `data:image/jpeg;base64,${base64Image}`,
                    },
                }]
            })
        ];

        // Call LLM and parse structured output
        const llm_with_structured_output = llm.withStructuredOutput(OpenRoleSchema);
        const response = await llm_with_structured_output.invoke(messages);

        await page.close()
        await browser.disconnect()

        return response.isOpen ?? false;
    } catch (error) {
        console.error("Error in parseTransaction:", error);
        return undefined; // Return undefined on failure
    }
}