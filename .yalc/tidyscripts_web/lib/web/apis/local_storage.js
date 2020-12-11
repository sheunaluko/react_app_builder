import * as fp from "../../common/util/fp";
let LS = window.localStorage;
// - 
var storage_header = "tidyscri";
export function set_storage_header(h) { storage_header = h; }
export function dot_join(a) { return a.join("."); }
export function full_name(n) { return dot_join([storage_header, n]); }
//storing and getting from LS 
export function store(o, n) { LS[full_name(n)] = JSON.stringify(o); }
export function get(n) {
    let data = LS[full_name(n)];
    if (data) {
        return JSON.parse(data);
    }
    else {
        return null;
    }
}
export function get_keys() { return Object.keys(LS); }
export function get_header(h) {
    //returns all local storage objects which match under a header
    let obs = get_keys();
    return fp.filter(obs, (s) => s.startsWith(h));
}
export function store_t(o, n) {
    let msg = {
        timestamp: Number(new Date()),
        data: o
    };
    store(msg, n);
}
export function get_t(n) {
    return get(n);
}
//# sourceMappingURL=local_storage.js.map