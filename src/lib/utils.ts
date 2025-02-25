import { promisify } from "util";
import { configFirecrawl } from "./firecrawl/client";
import { configGpt } from "./openai/client";
import { lookup } from 'dns';


export function delay(milliseconds: number) {
    return new Promise(function (resolve) {
        setTimeout(resolve, milliseconds)
    });
}

export function configure(firecrawlApiKey: string, openaiApiKey: string) {
    configFirecrawl(firecrawlApiKey);
    configGpt(openaiApiKey);
}


const lookupAsync = promisify(lookup);
export async function changeUrlHostToUseIp(urlString: string) {
    const urlParsed = new URL(urlString);
    const { address: hostIp } = await lookupAsync(urlParsed.hostname);
    urlParsed.hostname = hostIp;
    return urlParsed.toString();
}