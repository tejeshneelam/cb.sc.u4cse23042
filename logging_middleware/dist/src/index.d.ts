export declare class Logger {
    private stack;
    private pkg;
    constructor(stack: string, pkg: string);
    log(level: 'info' | 'error' | 'warn' | 'debug', message: string): Promise<void>;
    info(message: string): void;
    error(message: string): void;
}
