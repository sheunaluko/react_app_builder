import * as common from "../../common/util/index";
let log = common.Logger("key_presses");
let fp = common.fp;
let debug = common.debug;
/*
   
   Utilities for detecting key presses on the browser window
   
 */
export function load_key_handlers(keymap) {
    window.onkeypress = function (e) {
        log("Keypress!");
        let key = e.key;
        console.log(key);
        if (keymap[key]) {
            keymap[key]();
        }
    };
}
//# sourceMappingURL=keypresses.js.map