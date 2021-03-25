/*
   
   Unix style pipe processing in typescript for use in deno and web
   Sat 20 Mar 2021 14:30:04 PDT
   @Copyright Sheun Aluko
   
 */
import { IOChannel } from "./stdio_channel";
/* ---  */
var IOPacketType;
(function (IOPacketType) {
    IOPacketType[IOPacketType["Data"] = 0] = "Data";
    IOPacketType[IOPacketType["Error"] = 1] = "Error";
    IOPacketType[IOPacketType["EOF"] = 2] = "EOF";
})(IOPacketType || (IOPacketType = {}));
function RunIOPipeline(iop, globalIO) {
    let { stdin, stdout, stderr } = globalIO;
    let running_pipeline = [];
    let initialArgs = {
        stdin,
        stdout: (new IOChannel()),
        stderr,
    };
    let lastArgs = iop.reduce(function (args, p) {
        // -- 
        p(args); //will start the process 
        //add to the running pipeline 
        running_pipeline.push([p, args]);
        //and return the next args 
        return {
            stdin: args.stdout,
            stdout: (new IOChannel()),
            stderr,
        };
    }, initialArgs);
    //finally we connect the returned stdout to the global stdout 
    lastArgs.stdin.connect(stdout);
    //and return the running pipeline 
    return running_pipeline;
}
var EOF = {
    type: IOPacketType.EOF
};
export { IOPacketType, RunIOPipeline, IOChannel, EOF };
//# sourceMappingURL=stdio.js.map