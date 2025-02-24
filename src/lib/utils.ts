import { configFirecrawl } from "./firecrawl/client";
import { configGpt } from "./openai/client";

export function delay(milliseconds: number) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, milliseconds)
    });
 }

 export function configure(firecrawlApiKey: string, openaiApiKey: string) {
    configFirecrawl(firecrawlApiKey);
    configGpt(openaiApiKey);
 }