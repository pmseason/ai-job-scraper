import FirecrawlApp from "@mendable/firecrawl-js";

let app: FirecrawlApp;

export function configFirecrawl(apiKey: string) {
    app = new FirecrawlApp({
        apiKey: apiKey,
    });
}

export { app };
