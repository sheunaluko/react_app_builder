export interface ClientOps {
    host: string;
    port: string | number;
    secure: boolean;
    id: string;
}
interface CallFunctionOps {
    id: string;
    args: {
        [k: string]: any;
    };
}
interface RegisterFunctionOps {
    id: string;
    handler: (args: {
        [k: string]: any;
    }) => any;
    args_info: any[];
}
export declare class Client {
    ops: ClientOps;
    conn: any;
    log: any;
    function_table: {
        [k: string]: any;
    };
    lobby: {
        [k: string]: any;
    };
    registration_promise: Promise<string>;
    fullfill_registration: any;
    constructor(ops: ClientOps);
    connect(secure?: boolean): Promise<string>;
    handle_call(msg: {
        args: any;
        call_identifier: string;
        id: string;
    }): Promise<void>;
    handle_return_value(msg: {
        call_identifier: string;
        data: any;
    }): void;
    send(msg: object): void;
    register(): void;
    register_function(ops: RegisterFunctionOps): void;
    get_available_functions(): Promise<unknown>;
    call(ops: CallFunctionOps): Promise<unknown>;
    await_registration(): Promise<string>;
    gen_call_id(): string;
}
export declare function test_client(): Promise<void>;
export {};