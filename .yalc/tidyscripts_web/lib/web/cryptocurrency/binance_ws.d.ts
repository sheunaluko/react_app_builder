interface SymSocketOps {
    sym: string;
    handler: (e: any) => void;
    open?: () => void;
    error?: (e: any) => void;
    close?: () => void;
}
export declare function spot_kline_socket(ops: SymSocketOps, interval?: string): WebSocket;
export declare function basic_spot_kine_socket(sym: string, handler?: (e: any) => void): WebSocket;
export declare function spot_trade_socket(ops: SymSocketOps): WebSocket;
export declare function basic_spot_trade_socket(sym: string, handler?: (e: any) => void): WebSocket;
export {};
