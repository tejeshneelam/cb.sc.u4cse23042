"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const axios_1 = __importDefault(require("axios"));
class Logger {
    stack;
    pkg;
    constructor(stack, pkg) {
        this.stack = stack;
        this.pkg = pkg;
    }
    async log(level, message) {
        const payload = {
            stack: this.stack,
            level: level,
            package: this.pkg,
            message: message
        };
        try {
            let token = 'dummy_token';
            if (typeof process !== 'undefined' && process.env && process.env.ACCESS_TOKEN) {
                token = process.env.ACCESS_TOKEN;
            }
            await axios_1.default.post('http://20.207.122.201/evaluation-service/log', payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        }
        catch (e) {
            // No console.log
        }
    }
    info(message) { this.log('info', message); }
    error(message) { this.log('error', message); }
}
exports.Logger = Logger;
