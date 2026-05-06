import axios from 'axios';
export class Logger {
    private stack: string;
    private pkg: string;
    constructor(stack: string, pkg: string) {
        this.stack = stack;
        this.pkg = pkg;
    }
    async log(level: 'info' | 'error' | 'warn' | 'debug', message: string) {
        const payload = { stack: this.stack, level: level, package: this.pkg, message: message };
        try {
            await axios.post('http://20.207.122.201/evaluation-service/log', payload, {
                headers: { 
                    'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : 'dummy'}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch {}
    }
    info(message: string) { this.log('info', message); }
    error(message: string) { this.log('error', message); }
}
