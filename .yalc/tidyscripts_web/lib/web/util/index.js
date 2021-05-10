var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as common from "../../common/util/index"; //common utilities  
export { common };
import * as tts from "./tts";
import * as speech_recognition from "./speech_recognition";
import * as sounds from "./sounds";
import * as audio_processing from "./audio_processing";
import * as voice_interface from "./voice_interface";
import * as ws from "./ws";
import * as http from "./base_http";
import { ExternalLogger } from "./ext_log";
export { tts, ws, ExternalLogger, http, speech_recognition, sounds, voice_interface, audio_processing };
let log = common.Logger("wutil");
export function alert(s) {
    log("Alerting web page!");
    window.alert(s);
}
export function is_chrome() {
    return /Chrome/.test(window.navigator.userAgent) && /Google Inc/.test(navigator.vendor);
}
export function is_mobile() {
    return /Mobi/.test(window.navigator.userAgent);
}
// from https://stackoverflow.com/questions/105034/how-to-create-guid-uuid => 
export function uuid() {
    var buf = new Uint32Array(4);
    window.crypto.getRandomValues(buf);
    var idx = -1;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        idx++;
        var r = (buf[idx >> 3] >> ((idx % 8) * 4)) & 15;
        var v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
;
export function define(promise, id) {
    return __awaiter(this, void 0, void 0, function* () {
        window[id] = yield promise;
        log(`Defined ${id} on the window object :)`);
    });
}
export function automate_input(id, q) {
    /*
       Interesting discussion here about programmatically triggering onChange for react input elements
       https://hustle.bizongo.in/simulate-react-on-change-on-controlled-components-baa336920e04
     */
    let input = document.getElementById(id);
    if (input) {
        var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeInputValueSetter.call(input, q);
        var inputEvent = new Event('input', { bubbles: true });
        input.dispatchEvent(inputEvent);
    }
}
//# sourceMappingURL=index.js.map