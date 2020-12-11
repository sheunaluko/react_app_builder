var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let log = console.log;
export class Channel {
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
    flush() {
        //will clear the channel queue by sending nulls 
        //any values that have been written will be forgotten 
        this.value_que = [];
        //any promises that are waiting will get nulls 
        for (var i = 0; i < this.promise_que.length; i++) {
            let [resolve, reject] = this.promise_que.shift();
            resolve(null);
        }
        console.log("Flushed channel");
    }
    log_data() {
        return __awaiter(this, void 0, void 0, function* () {
            log("Chan read loop initiated");
            while (true) {
                let val = yield this.read();
                log("Got value:");
                log(val);
            }
        });
    }
}
//# sourceMappingURL=channel.js.map