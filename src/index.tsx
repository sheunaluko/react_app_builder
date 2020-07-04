import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import * as tsw from 'tidyscripts_web'  
/* 
   This repo contains the ability to compile many typescript react applications for development purposes 
   To compile a specific app, simply import the top level App.tsx file 
*/ 
import App from './apps/dream_catcher/App';


declare var window : any ; 

window.tsw = tsw
window.fp = tsw.util.common.fp
window.tts = tsw.util.tts 
window.sr = tsw.util.speech_recognition 
window.vi = tsw.util.voice_interface 

ReactDOM.render(
    <App />, 
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

