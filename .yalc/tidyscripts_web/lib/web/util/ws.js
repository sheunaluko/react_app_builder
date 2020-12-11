import * as common from "../../common/util/index"; //common utilities  
let log = common.Logger("ws");
export function WebSocketMaker(ops) {
    var { url, handler, open, error, close } = ops;
    /*  get params ready     */
    open = open || (() => { log(`ws to ${url} opened`); });
    close = close || (() => { log(`ws to ${url} closed`); });
    error = error || ((e) => { log(`ws to ${url} errored: ${JSON.stringify(e)}`); });
    /* go .. */
    let ws = new WebSocket(url);
    ws.onopen = open;
    ws.onclose = close;
    ws.onerror = error;
    ws.onmessage = (e) => { handler(e.data); };
    return ws;
}
//# sourceMappingURL=ws.js.map