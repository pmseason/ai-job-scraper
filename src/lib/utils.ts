import { promisify } from "util";
import { configFirecrawl } from "./firecrawl/client";
import { configGpt } from "./openai/client";
import { lookup } from 'dns';
import axios from "axios";


export function delay(milliseconds: number) {
    return new Promise(function (resolve) {
        setTimeout(resolve, milliseconds)
    });
}

export function configure(firecrawlApiKey: string, openaiApiKey: string) {
    process.env.FIRECRAWL_API_KEY = firecrawlApiKey;
    process.env.OPENAI_API_KEY = openaiApiKey;
    configFirecrawl();
    configGpt();
}

export async function testConnection(chromeUrl?: string): Promise<boolean> {
    try {
        const response = await axios.get(`${chromeUrl ?? "http://localhost:9222"}/json/version`);
        const { webSocketDebuggerUrl } = response.data;
        return webSocketDebuggerUrl ? true : false;
    } catch (error) {
        return false;
    }
}


const lookupAsync = promisify(lookup);
export async function changeUrlHostToUseIp(urlString: string) {
    const urlParsed = new URL(urlString);
    const { address: hostIp } = await lookupAsync(urlParsed.hostname);
    urlParsed.hostname = hostIp;
    return urlParsed.toString();
}