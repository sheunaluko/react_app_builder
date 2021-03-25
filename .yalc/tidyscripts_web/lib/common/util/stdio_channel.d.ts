import type { IOPacket, IOData } from "./stdio";
declare type resolver = any;
declare type rejector = any;
declare type promiseEntry = [resolver, rejector];
export declare class IOChannel {
    value_que: any[];
    promise_que: promiseEntry[];
    constructor();
    read(): Promise<IOPacket>;
    write(data: IOPacket): void;
    write_data(data: IOData): void;
    write_EOF(): void;
    clear_buffer(): void;
    clear_waiting(data: IOPacket): void;
    connect(that_chan: IOChannel): IOChannel;
}
export {};
