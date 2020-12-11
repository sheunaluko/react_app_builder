export interface WsOps {
    url: string;
    handler: (e: any) => void;
    error?: (e: any) => void;
    close?: () => void;
    open?: () => void;
}
export declare function WebSocketMaker(ops: WsOps): WebSocket;
