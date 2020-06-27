import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import * as tys from 'tidyscripts_web'  
/* 
   This repo contains the ability to compile many typescript react applications for development purposes 
   To compile a specific app, simply import the top level App.tsx file 
*/ 
import App from './apps/dream_catcher/App';


declare var window : any ; 

window.tys = tys 
window.fp = tys.util.common.fp


ReactDOM.render(
    <App />, 
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

