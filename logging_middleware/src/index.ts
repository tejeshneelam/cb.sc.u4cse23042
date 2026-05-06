import axios from 'axios';

export class Logger {
    private stack: string;
    private pkg: string;

    constructor(stack: string, pkg: string) {
        this.stack = stack;
        this.pkg = pkg;
    }

    async log(level: 'info' | 'error' | 'warn' | 'debug', message: string) {
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
            await axios.post('http://20.207.122.201/evaluation-service/log', payload, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (e) {
            // No console.log
        }
    }

    info(message: string) { this.log('info', message); }
    error(message: string) { this.log('error', message); }
}
