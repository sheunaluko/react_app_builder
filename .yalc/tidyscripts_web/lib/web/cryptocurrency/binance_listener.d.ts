interface SoundOps {
    freq: {
        buy: number;
        sell: number;
    };
    duration: {
        buy: number;
        sell: number;
    };
}
export declare var sound_options: SoundOps;
export declare function set_sound_options(s: SoundOps): void;
export declare function buy_beep(gain?: number): void;
export declare function sell_beep(gain?: number): void;
export declare function trade_beeper(sym: string): WebSocket;
export {};
