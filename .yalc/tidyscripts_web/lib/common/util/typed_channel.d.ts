declare type resolver = any;
declare type rejector = any;
declare type promiseEntry = [resolver, rejector];
export declare class Channel<Packet> {
    value_que: any[];
    promise_que: promiseEntry[];
    constructor();
    read(): Promise<Packet>;
    write(data: Packet): void;
    clear_buffer(): void;
    clear_waiting(data: Packet): void;
    connect(that_chan: Channel<Packet>): Channel<Packet>;
}
export {};
