/*
   Implementing speech recognition for the browser (chrome)
   Thu Jul  2 09:05:48 PDT 2020
*/
export function get_recognition_object(ops = {}) {
    let { result_dispatch = "tidyscripts_web_speech_recognition_result" } = ops;
    let { continuous = true, interimResults = false, onStart = () => { console.log("Recognition started"); }, onSoundStart = () => { console.log("Sound started..."); }, onSoundEnd = () => { console.log("Sound ended..."); }, onSpeechStart = () => { console.log("Speech started..."); }, onSpeechEnd = () => { console.log("Speech ended..."); }, onResult = function (e) {
        let result = e.results[e.resultIndex][0].transcript;
        console.log("Recognition result: " + result);
        window.dispatchEvent(new CustomEvent(result_dispatch, { detail: result }));
    }, onError = (e) => { console.log("Recognition error: "); console.log(e); }, onEnd = () => { console.log("Recognition ended"); }, lang = 'en-US', } = ops;
    let rec = new window.webkitSpeechRecognition();
    rec.onresult = onResult;
    rec.onerror = onError;
    rec.onend = onEnd;
    rec.continuous = continuous;
    rec.interimResults = interimResults;
    rec.onstart = onStart;
    rec.onsoundstart = onSoundStart;
    rec.onsoundend = onSoundEnd;
    rec.onspeechstart = onSpeechStart;
    rec.onspeechend = onSpeechEnd;
    return rec;
}
//# sourceMappingURL=speech_recognition.js.map