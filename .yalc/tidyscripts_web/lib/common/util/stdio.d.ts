import { IOChannel } from "./stdio_channel";
declare enum IOPacketType {
    Data = 0,
    Error = 1,
    EOF = 2
}
interface IOErrorPacket {
    type: IOPacketType.Error;
    msg: string;
    metadata: any;
}
declare type IOData = any;
declare type IOMetadata = any;
interface IOEOFPacket {
    type: IOPacketType.EOF;
}
interface IODataPacket {
    type: IOPacketType.Data;
    data: IOData;
    metadata?: IOMetadata;
}
declare type IOPacket = (IOEOFPacket | IODataPacket | IOErrorPacket);
interface IOArgs {
    stdin: IOChannel;
    stdout: IOChannel;
    stderr: IOChannel;
    extra?: any;
}
declare type IOProcess = (args: IOArgs) => Promise<void>;
declare type IOPipeline = IOProcess[];
declare type IOProcessArgTuple = [IOProcess, IOArgs];
declare type IORunningPipeline = IOProcessArgTuple[];
declare function RunIOPipeline(iop: IOPipeline, globalIO: IOArgs): IORunningPipeline;
declare var EOF: {
    type: IOPacketType;
};
export type { IOErrorPacket, IOData, IOMetadata, IOEOFPacket, IODataPacket, IOPacket, IOArgs, IOProcess, IOPipeline, IOProcessArgTuple, IORunningPipeline, };
export { IOPacketType, RunIOPipeline, IOChannel, EOF };
