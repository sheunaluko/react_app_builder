export declare class ExternalLogger {
    logger: any;
    name: string;
    constructor(name: string);
    set_logger(f: any): void;
    log(...args: any): void;
}
