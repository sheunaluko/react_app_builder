/*
 Typescript browser tts
 Fri Jul  3 02:13:20 PDT 2020
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as asnc from "../../common/util/async";
import * as fp from "../../common/util/fp";
export var tts = window.speechSynthesis;
export var speech_que = [];
export function finished_utterance() {
    return __awaiter(this, void 0, void 0, function* () {
        let timeout = yield asnc.wait_until(() => {
            return (!tts.speaking);
        }, Infinity, 200);
        return;
    });
}
export function finished_speaking() {
    return __awaiter(this, void 0, void 0, function* () {
        let timeout = yield asnc.wait_until(() => {
            return (!tts.speaking && speech_que.length < 1);
        }, Infinity, 200);
        return;
    });
}
export function is_speaking() {
    return (tts.speaking || (speech_que.length > 0));
}
export function _speak(ops) {
    return __awaiter(this, void 0, void 0, function* () {
        let { voice = 49, rate = 1, text } = ops;
        if (!tts.speaking) {
            var utterance = new window.SpeechSynthesisUtterance(text);
            utterance.voice = tts.getVoices()[voice];
            //utterance.pitch = pitch.value;
            utterance.rate = rate;
            tts.speak(utterance);
            let _ = yield finished_utterance();
            let next = speech_que.shift();
            if (next) {
                //modify ops 
                _speak(next);
            }
            else {
                //pass
                console.log("done with speech que");
            }
        }
        else {
            console.log("Scheduling speech for later.");
            speech_que.push(ops);
        }
    });
}
export function speak(ops) {
    let { voice = 49, rate = 1, text } = ops;
    console.log("Request to speak  =:> " + text);
    /*chunk up the text by word length */
    let chunks = fp.map(fp.partition(fp.split(text, " "), 20), fp.joiner(" "));
    /* and pass them to the speak function */
    chunks.forEach(function (c) {
        let new_ops = fp.clone(ops);
        new_ops.text = c;
        _speak(new_ops);
    });
}
//# sourceMappingURL=tts.js.map