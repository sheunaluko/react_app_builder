/*
 Main voice interface for controlling speech recognition and tts at high level
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
import * as sr from "./speech_recognition";
import * as tts from "./tts";
import * as ap from "./audio_processing";
/*
 audio_processing.ts    | connects to microphone and detects when there is sound occuring
 speech_recognition.ts  | starts and stops speech recognition and provides recognition results
 tts.ts                 | will perform speech synthesis given a string
 
 This file combines the three aforementioned libraries to create an out of the box seamless
 voice/ tts experience.
 
 The audio processor is used to detect when a spike in volume has occured, and it triggers
 the speech recognizer to start listening.
 
 When the tts.speak function is called, the speech recognizer is automatically paused until tts
 has finished.
 
 To use, simply call initialize_recognition() , and the recognition results will be available by
 listending to the window.addEventListener( 'tidyscripts_web_speech_recognition_result' , (e) => e.detail ) handler
 
 For tts, call speak(text)
 
 
*/
export var recognition = null;
export var RecognitionState;
(function (RecognitionState) {
    RecognitionState["NULL"] = "NULL";
    RecognitionState["STOPPED"] = "STOPPED";
    RecognitionState["PAUSED"] = "PAUSED";
    RecognitionState["LISTENING"] = "LISTENING";
    RecognitionState["STOPPING"] = "STOPPING";
})(RecognitionState || (RecognitionState = {}));
export var recognition_state = RecognitionState.NULL;
export function initialize_recognition(ops) {
    stop_recognition();
    ops = ops || {};
    let old_on_end = ops.onEnd;
    ops.onEnd = function () {
        if (recognition_state == RecognitionState.STOPPING) {
            console.log("Recognition stopped");
            recognition_state = RecognitionState.STOPPED;
        }
        else {
            recognition_state = RecognitionState.PAUSED;
            console.log("Recognition paused");
        }
        //any other on end callbacks 
        old_on_end ? old_on_end() : null;
    };
    recognition = sr.get_recognition_object(ops);
    recognition_state = RecognitionState.PAUSED;
    //now we start the audio detector
    ap.audio_detector(start_recognition);
    return;
}
export function pause_recognition() {
    if (recognition) {
        recognition.abort();
        recognition_state = RecognitionState.PAUSED;
    }
}
export function stop_recognition() {
    if (recognition) {
        console.log("Stopping recognition");
        recognition_state = RecognitionState.STOPPING;
        recognition.abort();
        recognition = null;
    }
    ap.stop();
}
export function start_recognition() {
    return __awaiter(this, void 0, void 0, function* () {
        if (recognition_state == RecognitionState.LISTENING) {
            //console.log("Already listening")
            return;
        }
        //if tts is speaking then we should wait     
        if (tts.is_speaking()) {
            console.log("Wont start recognition while tts active");
        }
        if (recognition) {
            recognition.start();
        }
        else {
            initialize_recognition();
            console.log("Recognition initialized without args");
        }
        recognition_state = RecognitionState.LISTENING;
    });
}
export function stop_recognition_and_detection() {
    let ap_thresh = ap.detection_threshold;
    pause_recognition();
    ap.set_detection_threshold(Infinity); //stop the detection 
    return ap_thresh;
}
export function start_recognition_and_detection(t) {
    start_recognition();
    ap.set_detection_threshold(t);
}
export var default_voice = null;
export function set_default_voice(v) {
    default_voice = v;
}
export function speak_with_voice(text, voiceURI) {
    return __awaiter(this, void 0, void 0, function* () {
        if (recognition) {
            let thresh = stop_recognition_and_detection();
            tts.speak({ text, voiceURI });
            yield tts.finished_speaking();
            start_recognition_and_detection(thresh);
        }
        else {
            tts.speak({ text, voiceURI });
            yield tts.finished_speaking();
        }
        return;
    });
}
export function speak(text) {
    return __awaiter(this, void 0, void 0, function* () {
        speak_with_voice(text, default_voice);
    });
}
//# sourceMappingURL=voice_interface.js.map