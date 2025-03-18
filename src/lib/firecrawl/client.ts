import FirecrawlApp from "@mendable/firecrawl-js";

let app: FirecrawlApp;

export function configFirecrawl() {
    app = new FirecrawlApp({
        apiKey: process.env.FIRECRAWL_API_KEY,
    });
}

export { app };
