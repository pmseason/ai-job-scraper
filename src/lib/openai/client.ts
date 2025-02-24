import OpenAI from 'openai';

let client: OpenAI;

export function configGpt(apiKey: string) {
    client = new OpenAI({
        apiKey: apiKey,
    });
}

export { client };
