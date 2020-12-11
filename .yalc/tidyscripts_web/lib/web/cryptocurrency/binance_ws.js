/*
 @Copyright Sheun Aluko
 Binance websocket
 Sat Jul 18 10:14:45 PDT 2020
*/
import { WebSocketMaker } from "../util/ws";
import * as common from "../../common/util/index"; //common utilities  
let log = common.Logger("bws");
export function spot_kline_socket(ops, interval) {
    let { sym, handler, error, close, open } = ops;
    sym = sym.toLowerCase();
    interval = interval || "1m";
    let url = `wss://stream.binance.com:9443/ws/${sym}@kline_${interval}`;
    log("Using url for spot kline socket: " + url);
    return WebSocketMaker({ url, handler, error, close, open });
}
export function basic_spot_kine_socket(sym, handler) {
    handler = handler || ((e) => { console.log(JSON.parse(e)); });
    return spot_kline_socket({ sym, handler });
}
export function spot_trade_socket(ops) {
    let { sym, handler, error, close, open } = ops;
    sym = sym.toLowerCase();
    let url = `wss://stream.binance.com:9443/ws/${sym}@aggTrade`;
    log("Using url for spot trade socket: " + url);
    return WebSocketMaker({ url, handler, error, close, open });
}
export function basic_spot_trade_socket(sym, handler) {
    handler = handler || ((e) => { console.log(JSON.parse(e)); });
    return spot_trade_socket({ sym, handler });
}
//# sourceMappingURL=binance_ws.js.map