import * as binance_ws from "./binance_ws";
import * as sounds from "../util/sounds";
export var sound_options = {
    freq: {
        buy: 620,
        sell: 580,
    },
    duration: {
        buy: 30,
        sell: 30,
    }
};
export function set_sound_options(s) { sound_options = s; }
export function buy_beep(gain) {
    sounds.tone({ freq: sound_options.freq.buy,
        gain,
        duration: sound_options.duration.buy });
}
export function sell_beep(gain) {
    sounds.tone({ freq: sound_options.freq.sell,
        gain,
        duration: sound_options.duration.sell });
}
export function trade_beeper(sym) {
    let handler = function (d) {
        let trade = JSON.parse(d);
        let { m: sell, p, q, } = trade;
        let tmp = Number(q);
        let gain = (tmp > 1 ? 1 : tmp);
        console.log(trade);
        (sell ? sell_beep(gain) : buy_beep(gain));
    };
    return binance_ws.basic_spot_trade_socket(sym, handler);
}
//# sourceMappingURL=binance_listener.js.map