//working with dates
import { Logger } from "./logger";
let log = Logger("dates");
export function to_iso(d) {
    return d.toISOString();
}
export function iso_now() {
    return to_iso(new Date());
}
export function to_iso_day_filename(d) {
    return to_iso(d).split("T")[0].replace(/-/g, "_");
}
export function iso_day_filename() {
    return to_iso_day_filename(new Date());
}
export function to_ms(d) { return Number(d); }
export function dates_eq(d1, d2) {
    return (d1.getTime() == d2.getTime());
}
export function copy_date(d) { return new Date(d.getTime()); }
export function day_string(d) {
    return d.toString().split(" ").slice(0, 4).join(" ").replace(" ", "_");
}
export function round_date(in_date, t) {
    let d = copy_date(in_date); // dont modify it
    switch (t) {
        case 'year':
            d.setMonth(0);
        case 'month':
            d.setDate(1);
        case 'day':
            d.setHours(0);
        case 'hour':
            d.setMinutes(0);
        case 'minute':
            d.setSeconds(0);
        case 'second':
            d.setMilliseconds(0);
        case 'millisecond':
            //no need 
            break;
        default:
            return d;
    }
    return d;
}
export function shift_date(in_date, amt, t) {
    let d = copy_date(in_date);
    switch (t) {
        case 'year':
            d.setFullYear(d.getFullYear() + amt);
            break;
        case 'month':
            d.setMonth(d.getMonth() + amt);
            break;
        case 'day':
            d.setDate(d.getDate() + amt);
            break;
        case 'hour':
            d.setHours(d.getHours() + amt);
            break;
        case 'minute':
            d.setMinutes(d.getMinutes() + amt);
            break;
        case 'second':
            d.setSeconds(d.getSeconds() + amt);
            break;
        case 'millisecond':
            d.setMilliseconds(d.getMilliseconds() + amt);
            break;
        default:
            return d;
    }
    return d;
}
//# sourceMappingURL=dates.js.map