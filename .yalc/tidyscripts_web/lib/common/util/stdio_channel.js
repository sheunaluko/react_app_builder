var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { IOPacketType, EOF } from "./stdio";
let log = (m) => { console.log("[typedC]:: " + m); };
export class IOChannel {
    constructor() {
        this.value_que = [];
        this.promise_que = [];
    }
    read() {
        if (this.value_que.length > 0) {
            let value_que = this.value_que;
            let p = new Promise((resolve, rej) => {
                setTimeout(() => resolve(value_que.shift()), 0); //immediately resolve 
            });
            return p;
        }
        else {
            //have to create a new promise 
            let p = new Promise((resolve, reject) => {
                this.promise_que.push([resolve, reject]); //but save the resolver 
            });
            return p; //return the promise 
        }
    }
    write(data) {
        if (this.promise_que.length > 0) {
            //there is already a promise awaiting this result 
            let [resolve, reject] = this.promise_que.shift();
            resolve(data);
        }
        else {
            //no promise is waiting -- so we will instead push to the que 
            this.value_que.push(data);
        }
    }
    write_data(data) {
        let packet = {
            type: IOPacketType.Data,
            data: data,
        };
        this.write(packet);
    }
    write_EOF() {
        this.write(EOF);
    }
    clear_buffer() {
        //any values that have been written will be forgotten 
        this.value_que = [];
        log("Cleared buffer");
    }
    clear_waiting(data) {
        //will clear the awaiting queue by sending 'data'
        //any promises that are waiting will get nulls 
        for (var i = 0; i < this.promise_que.length; i++) {
            let [resolve, reject] = this.promise_que.shift();
            resolve(data);
        }
        log("Cleared awaiters");
    }
    connect(that_chan) {
        /*
           Connect output of one channel to another
           and return second channel
         */
        let this_chan = this;
        (function () {
            return __awaiter(this, void 0, void 0, function* () {
                while (true) {
                    let p = yield this_chan.read();
                    if (p.type == IOPacketType.EOF) {
                        that_chan.write(p); // have to propagate prior to disconnect 
                        break;
                    }
                    else {
                        that_chan.write(p);
                    }
                }
            });
        })();
        return that_chan;
    }
}
//# sourceMappingURL=stdio_channel.js.map