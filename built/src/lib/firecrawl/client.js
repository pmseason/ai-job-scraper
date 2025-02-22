"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const firecrawl_js_1 = __importDefault(require("@mendable/firecrawl-js"));
exports.app = new firecrawl_js_1.default({
    apiKey: process.env.FIRECRAWL_API_KEY,
});
