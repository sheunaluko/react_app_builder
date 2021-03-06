export declare function to_iso(d: Date): string;
export declare function iso_now(): string;
export declare function to_iso_day_filename(d: Date): string;
export declare function iso_day_filename(): string;
export declare function to_ms(d: Date): number;
export declare function ms_now(): number;
export declare function dates_eq(d1: Date, d2: Date): boolean;
export declare function copy_date(d: Date): Date;
export declare function day_string(d: Date): string;
export declare function round_date(in_date: Date, t: string): Date;
export declare function shift_date(in_date: Date, amt: number, t: string): Date;
export declare var times_in_ms: {
    "1sec": number;
    "5sec": number;
    "10sec": number;
    "30sec": number;
    "1min": number;
    "2min": number;
    "5min": number;
    "10min": number;
    "30min": number;
    "1hr": number;
    "1day": number;
};
