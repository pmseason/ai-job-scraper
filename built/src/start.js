"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const index_1 = require("./index");
// Path to Chrome
const chromeCommand = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const args = ['--remote-debugging-port=9222'];
// Start Chrome with debugging
const chromeProcess = (0, child_process_1.spawn)(chromeCommand, args, { detached: true, stdio: 'ignore' });
chromeProcess.on('error', (err) => {
    console.error('Failed to start Chrome:', err);
});
// Detach the Chrome process so it continues running after the Node process exits
chromeProcess.unref();
// Start your project
(0, index_1.main)();
