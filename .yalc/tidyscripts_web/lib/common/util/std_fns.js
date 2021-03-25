var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { IOPacketType, IOChannel, } from "./stdio";
export var debug = false;
export function set_debug(b) { debug = b; }
export var log = function (m) {
    if (debug) {
        console.log(m);
    }
};
function PT2IOProcess(packet_transformer) {
    return function (args) {
        return __awaiter(this, void 0, void 0, function* () {
            log("Running IO process... with args: ");
            log(args);
            while (true) {
                let packet = yield args.stdin.read();
                //check if we have reached EOF 
                log("process got packet");
                log(packet);
                if (packet.type == IOPacketType.EOF) {
                    args.stdout.write(packet);
                    break;
                }
                else {
                    //apply the packet transformer 
                    let new_packet = packet_transformer(packet);
                    args.stdout.write(new_packet);
                    log("transformed packet");
                    log("old");
                    log(packet);
                    log("new");
                    log(new_packet);
                }
            }
        });
    };
}
function DT2IOProcess(data_transformer) {
    let packet_transformer = function (p) {
        log("Data transformer: ");
        log(p);
        return Object.assign(Object.assign({}, p), { data: data_transformer(p.data) });
    };
    return PT2IOProcess(packet_transformer);
}
export var split = (sep) => DT2IOProcess((data) => data.split(sep));
export var index = (num) => DT2IOProcess((data) => data[num]);
export var to_number = () => DT2IOProcess((data) => Number(data));
export var inc = (num) => DT2IOProcess((data) => data + num);
export function logger_stdout(tag) {
    let ch = (new IOChannel());
    (function () {
        return __awaiter(this, void 0, void 0, function* () {
            while (true) {
                let p = yield ch.read();
                if (p.type == IOPacketType.EOF) {
                    console.log("EOF > done!");
                    break;
                }
                else {
                    p = p; //will fix later
                    console.log(`[${tag}]:: ${p.data}`);
                }
            }
        });
    })();
    return ch;
}
export function string_producer(text, sep) {
    let tokens = text.split(sep);
    //log(tokens)
    return function (args) {
        return __awaiter(this, void 0, void 0, function* () {
            //write tokens to stdout 
            //log(tokens) 
            tokens.map((t) => {
                //log(t)
                let packet = {
                    type: IOPacketType.Data,
                    data: t,
                };
                args.stdout.write(packet);
                log("string wrote");
                log(packet);
            });
            //then write EOF  
            args.stdout.write({ type: IOPacketType.EOF });
        });
    };
}
//# sourceMappingURL=std_fns.js.map