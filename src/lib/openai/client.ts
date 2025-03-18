import OpenAI from 'openai';

let client: OpenAI;

export function configGpt() {
    client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
}

export { client };
