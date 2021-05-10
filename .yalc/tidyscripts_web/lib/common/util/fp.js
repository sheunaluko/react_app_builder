// need to implement deep copy 
export function shallow_copy(o) {
    if (is_array(o)) {
        return clone_array(o);
    }
    if (is_map(o)) {
        return clone(o);
    }
    return o;
}
/* MAPS  */
export function clone(o) {
    let cpy = Object.assign({}, o);
    return cpy;
}
export function keys(a) {
    return Object.keys(a);
}
export function values(a) {
    let ks = keys(a);
    let cloned = clone(a);
    if (is_empty(ks)) {
        return [];
    }
    return map(ks, (k) => cloned[k]);
}
export function merge_dictionary(a, b) {
    return Object.assign(clone(a), b);
}
export function merge_dictionaries(ds) {
    return ds.reduce(merge_dictionary, {});
}
export function get(o, a) {
    return o[a];
}
export function set(o, a, val) {
    o[a] = val;
    return o;
}
export function set_im(o, a, val) {
    let cpy = clone(o);
    cpy[a] = val;
    return cpy;
}
export function getter(a) {
    return function (o) {
        return o[a];
    };
}
export function setter(a, val) {
    return function (o) {
        return set(o, a, val);
    };
}
export function setter_im(a, val) {
    return function (o) {
        return set(o, a, val);
    };
}
export function is_empty_map(o) {
    return (is_map(o) && is_zero(len(keys(o))));
}
export function update_at(o, path, fn) {
    var ref = o;
    for (var k = 0; k < path.length - 1; k++) {
        ref = ref[k];
    }
    let lk = last(path);
    ref[lk] = fn(ref[lk]);
    return clone(o); //this could be unideal -- maybe should be cloning first? 
}
export function map_items(o) {
    let ks = keys(o);
    let vs = values(o);
    return zip2(ks, vs);
}
export var dict_to_list = map_items;
export function map_over_dic_values(o, f) {
    let vs = values(o);
    let new_vs = map(vs, f);
    return zip_map(keys(o), new_vs);
}
/* ARRAYS  */
export function clone_array(o) {
    return JSON.parse(JSON.stringify(o));
}
export function first(arr) {
    return arr[0];
}
export function second(arr) {
    return arr[1];
}
export function third(arr) {
    return arr[2];
}
export function fourth(arr) {
    return arr[3];
}
export function last(arr) {
    let len = arr.length;
    return arr[len - 1];
}
export function nth(arr, n) {
    return arr[n];
}
export function indexer(i) {
    //returns a function that will index at a given location 
    return function (o) {
        return nth(o, i);
    };
}
export function all_true(arr) {
    return arr.reduce((a, b) => (a && b));
}
export function any_true(arr) {
    if (is_empty(arr)) {
        return false;
    }
    ;
    return arr.reduce((a, b) => (a || b));
}
export function all_false(arr) {
    return !any_true(arr);
}
export function any_false(arr) {
    return !all_true(arr);
}
export function repeat(thing, num) {
    let arr = [];
    for (var i of range(num)) {
        arr.push(shallow_copy(thing));
    }
    return arr;
}
export function range(n, end = null) {
    if (end) {
        let num = (end - n);
        var arr = Array(num).fill(0);
        for (var i = 0; i < arr.length; i++) {
            arr[i] = i + n;
        }
        return arr;
    }
    else {
        var arr = Array(n).fill(0);
        for (var i = 0; i < arr.length; i++) {
            arr[i] = i;
        }
        return arr;
    }
}
export function map(arr, mapper) {
    return arr.map(mapper);
}
export function enumerate(o) {
    /*
       Like pythons enumerate, converts a list into a list of tuples where the first element
       in the tuple is the index
     */
    let num = len(o);
    return map(range(num), (i) => [i, o[i]]);
}
export function enumermap(os, f) {
    let results = [];
    for (var [i, o] of enumerate(os)) {
        results.push(f(i, o));
    }
    return results;
}
export function concat(a, b) {
    return a.concat(b);
}
export function map_get(o, k) {
    return map(o, getter(k));
}
export function map_set(o, k, val) {
    return map(o, setter(k, val));
}
export function map_set_im(o, k, val) {
    return map(o, setter_im(k, val));
}
export function is_zero(n) { return (n == 0); }
export function len(arr) {
    return arr.length;
}
export function is_empty_array(o) {
    return (is_array(o) && is_zero(len(o)));
}
export function is_empty(o) {
    return (is_null(o) || is_undefined(o) || is_empty_array(o) || is_empty_string(o) || is_empty_map(o));
}
export function not_empty(o) { return !is_empty(o); }
export function filter(o, fn) {
    return o.filter(fn);
}
export function filter_key(os, k, fn) {
    return filter(os, (o) => fn(get(o, k)));
}
export function filter_key_equals(os, k, val) {
    return filter_key(os, k, (a) => a == val);
}
export function remove_empty(o) {
    return filter(o, not_empty);
}
export function any_is_array(o) {
    return any_true(map(o, is_array));
}
export function flat_once(o) {
    let tmp = o.flat();
    return tmp;
}
export function recursive_flat(o) {
    if (any_is_array(o)) {
        return recursive_flat(flat_once(o));
    }
    else {
        return o;
    }
}
export function recursive_flat_remove_empty(arr) {
    return remove_empty(recursive_flat(arr));
}
export function partition(arr, num) {
    var partitions = [];
    var curr = [];
    for (var i = 0; i < arr.length; i++) {
        curr.push(arr[i]);
        if (len(curr) == num) {
            partitions.push(curr);
            curr = [];
        }
    }
    partitions.push(curr);
    return remove_empty(partitions);
}
export function zip2(a1, a2) {
    let ret = [];
    for (var i = 0; i < a1.length; i++) {
        ret.push([a1[i], a2[i]]);
    }
    return ret;
}
export var zip = zip2;
export function list_to_dict(kvs) {
    let result = {};
    for (var [k, v] of kvs) {
        result[k] = v;
    }
    return result;
}
export function zip_map(a1, a2) {
    return list_to_dict(zip(a1, a2));
}
/*  TYPES  */
export function is_null(o) { return (o == null); }
export function is_undefined(o) { return (o == undefined); }
export function is_something(o) { return !(is_null(o) || is_undefined(o)); }
export function is_array(o) {
    return (is_something(o) && o.constructor == Array);
}
export function is_string(o) {
    return (is_something(o) && o.constructor == String);
}
export function is_object(o) {
    return (is_something(o) && o.constructor == Object);
}
export function is_map(o) {
    return (is_something(o) && is_object(o) && (!is_array(o)));
}
/* Strings */
export function is_empty_string(o) {
    return (o == "");
}
export function substring(str, s, e) {
    return str.substring(s, e);
}
export function nchars(str, n) {
    return substring(str, 0, n);
}
export function join(arr, ch) {
    let result = arr.join(ch);
    return result;
}
export function joiner(ch) {
    return function (s) {
        return join(s, ch);
    };
}
export function split(s, ch) {
    return s.split(ch);
}
export function format(s, _replacers) {
    let replacers = clone_array(_replacers);
    let nxt = replacers.shift();
    let ret = s;
    while (nxt) {
        ret = ret.replace("{}", String(nxt));
        nxt = replacers.shift();
    }
    return ret;
}
/* MATH */
export function add(a, b) { return a + b; }
export function subtract(a, b) { return a - b; }
export function multiply(a, b) { return a * b; }
export function divide(a, b) { return a / b; }
export function adder(n) {
    return function (x) {
        return x + n;
    };
}
export function subtractor(n) {
    return function (x) {
        return x - n;
    };
}
export function divider(n) {
    return function (x) {
        return x / n;
    };
}
export function multiplier(n) {
    return function (x) {
        return x * n;
    };
}
export function diff(a) {
    let result = [];
    for (var i = 1; i < a.length; i++) {
        result.push(a[i] - a[i - 1]);
    }
    return result;
}
// misc
export function equals(a, b) {
    return (a == b);
}
export function make_debouncer(d, cb) {
    var state = {
        attempt_ref: null
    };
    return (args) => {
        if (state.attempt_ref) {
            clearTimeout(state.attempt_ref); //cancel any previously stored callback attempt
        }
        //and reset with a new one
        state.attempt_ref = setTimeout(function () {
            cb(args);
        }, d);
    };
}
//# sourceMappingURL=fp.js.map