"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const client_1 = require("./lib/supabase/client");
const audit_1 = __importDefault(require("./audit"));
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("./lib/utils");
async function setupBrowser() {
    const response = await axios_1.default.get("http://localhost:9222/json/version");
    const { webSocketDebuggerUrl } = response.data;
    const browser = await puppeteer_core_1.default.connect({
        browserWSEndpoint: webSocketDebuggerUrl,
        defaultViewport: { width: 1440, height: 900 },
    });
    return browser;
}
async function fetchPositions() {
    const { data, error } = await client_1.supabase.from("positions").select("*");
    if (error) {
        console.error(error);
        return [];
    }
    return data;
}
async function main() {
    await (0, utils_1.delay)(5000);
    const browser = await setupBrowser();
    // const positions = await fetchPositions();
    // const positions = [];
    await (0, audit_1.default)(browser);
    browser.disconnect();
}
main();
