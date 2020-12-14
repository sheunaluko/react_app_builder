var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { useState, useEffect } from 'react';
import { useTheme } from '@material-ui/core/styles';
import * as mui from "./list";
let { Container, MicIcon, MicOffIcon, IconButton, } = mui;
/*
   
   1. Button for initializing mic and stopping the mic
   2. feedback panel which listens to 'tidyscripts_web_mic' event for the audio power
   3. window.addEventListener( 'tidyscripts_web_speech_recognition_result' , (e) => e.detail )
   To get the recognition result
   4. also handle the ON SOUND STarted event to give the user feedback
   
   5. two tabs -- one tab for TTS -> allow user to select the voice and save this to local storage
      -- need a local storage API!


 */
export default function Component() {
    const theme = useTheme();
    const [state, setState] = useState({
        listening: false,
        text: "...",
    });
    useEffect(() => {
        window.addEventListener('tidyscripts_web_speech_recognition_result', function (e) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("Got recognition result!");
                let text = e.detail.trim().toLowerCase();
                console.log(text);
                setState(Object.assign(Object.assign({}, state), { text: text }));
            });
        });
    }, []);
    return (React.createElement(Container, null,
        React.createElement("div", { style: {
                backgroundColor: theme.palette.background.paper,
                padding: "2%",
                borderRadius: "15px",
            } },
            React.createElement("div", null, "Voice Panel"),
            React.createElement("div", null,
                React.createElement(IconButton, { onClick: () => setState(Object.assign(Object.assign({}, state), { listening: !state.listening })) }, state.listening ? React.createElement(MicIcon, null) : React.createElement(MicOffIcon, null)),
                React.createElement("svg", { width: "150px", height: "200px", viewBox: "0 0 100 100" },
                    React.createElement("path", { stroke: "#00FF00", fill: "none", d: "M0,0 C36.42,0,70.58,100,100,100" }))))));
}
//# sourceMappingURL=VoicePanel.js.map