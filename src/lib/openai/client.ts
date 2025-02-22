import OpenAI from 'openai';

export const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    // baseURL: "https://api.pawan.krd/cosmosrp/v1"
});