declare type dic = {
    [k: string]: any;
};
export declare function clone(o: dic): dic;
export declare function keys(a: dic): string[];
export declare function values(a: dic): any[];
export declare function merge_dictionary(a: dic, b: dic): dic;
export declare function merge_dictionaries(ds: dic[]): dic;
export declare function get(o: dic, a: string): any;
export declare function set(o: dic, a: string, val: any): dic;
export declare function set_im(o: dic, a: string, val: any): dic;
export declare function getter(a: string): (o: dic) => any;
export declare function setter(a: string, val: any): (o: dic) => dic;
export declare function setter_im(a: string, val: any): (o: dic) => dic;
export declare function is_empty_map(o: any): boolean;
export declare function update_at(o: {
    [k: string]: any;
}, path: string[], fn: (x: any) => any): dic;
export declare function map_items(o: {
    [k: string]: any;
}): any[][];
export declare var dict_to_list: typeof map_items;
export declare function clone_array(o: any): any;
export declare function first<T>(arr: T[]): T;
export declare function last<T>(arr: T[]): T;
export declare function nth<T>(arr: T[], n: number): T;
export declare function indexer(i: number): (o: any[]) => any;
export declare function all_true(arr: boolean[]): boolean;
export declare function any_true(arr: boolean[]): boolean;
export declare function all_false(arr: boolean[]): boolean;
export declare function any_false(arr: boolean[]): boolean;
export declare function repeat<T>(thing: T, num: number): string[];
export declare function range(n: number, end?: any): number[];
export declare function map<I, O>(arr: I[], mapper: (x: I) => O): O[];
export declare function enumerate(o: any[]): [number, any][];
export declare function enumermap(os: any[], f: (i: number, o: any) => any): any[];
export declare function concat(a: any[], b: any[]): any[];
export declare function map_get(o: object[], k: string): any[];
export declare function map_set(o: object[], k: string, val: any): any[];
export declare function map_set_im(o: object[], k: string, val: any): any[];
export declare function is_zero(n: number): boolean;
export declare function len(arr: any[]): number;
export declare function is_empty_array(o: any): boolean;
export declare function is_empty(o: any): boolean;
export declare function not_empty(o: any): boolean;
export declare function filter(o: any[], fn: (a: any) => boolean): any[];
export declare function filter_key(os: object[], k: string, fn: (a: any) => boolean): object[];
export declare function filter_key_equals(os: object[], k: string, val: any): object[];
export declare function remove_empty(o: any[]): any[];
export declare function any_is_array(o: any[]): boolean;
export declare function flat_once(o: any[]): any[];
export declare function recursive_flat(o: any[]): any[];
export declare function recursive_flat_remove_empty(arr: any[]): any[];
export declare function partition(arr: any[], num: number): any[];
export declare function zip2(a1: any[], a2: any[]): any[][];
export declare var zip: typeof zip2;
export declare function list_to_dict(kvs: any): any[];
export declare function zip_map(a1: any[], a2: any[]): any[];
export declare function is_null(o: any): boolean;
export declare function is_undefined(o: any): boolean;
export declare function is_something(o: any): boolean;
export declare function is_array(o: any): boolean;
export declare function is_string(o: any): boolean;
export declare function is_object(o: any): boolean;
export declare function is_map(o: any): boolean;
export declare function is_empty_string(o: any): boolean;
export declare function substring(str: string, s: number, e: number): string;
export declare function nchars(str: string, n: number): string;
export declare function join(arr: string[], ch: string): string;
export declare function joiner(ch: string): (s: string[]) => string;
export declare function split(s: string, ch: any): string[];
export declare function format(s: string, _replacers: any[]): string;
export declare function add(a: number, b: number): number;
export declare function subtract(a: number, b: number): number;
export declare function multiply(a: number, b: number): number;
export declare function divide(a: number, b: number): number;
export declare function adder(n: number): (x: number) => number;
export declare function subtractor(n: number): (x: number) => number;
export declare function divider(n: number): (x: number) => number;
export declare function multiplier(n: number): (x: number) => number;
export declare function diff(a: number[]): number[];
export declare function equals(a: any, b: any): boolean;
export declare function make_debouncer(d: number, cb: any): (args: any[]) => void;
export {};