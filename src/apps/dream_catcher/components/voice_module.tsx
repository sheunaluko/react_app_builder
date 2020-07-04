
import React from 'react';
import HeadsetMicIcon from '@material-ui/icons/HeadsetMic';
import IconButton from '@material-ui/core/IconButton' 


import * as tsw from 'tidyscripts_web' 
let snd = tsw.util.sounds 

declare var window : any ; 

let vi = tsw.util.voice_interface //grab the voice interface 
let Channel = tsw.util.common.channel.Channel


//add the window listener and pipe it to the voice channel 
export var VoiceChannel = new Channel() 


export var handlers : any  = null 

console.log("Handlers")
console.log(handlers) 

window.addEventListener('tidyscripts_web_speech_recognition_result' , function(e :any) {
    console.log("Got recognition result!") 
    let text = e.detail.trim().toLowerCase()
    console.log(text) 
    
    if (handlers)  { 
	console.log("Processing handlers")
	if (handlers.constructor == Function) { 
	    console.log("handling function") 
	    handlers(text) 
	    return 
	} 
	
	let handler  = handlers[text] 
	if (handler) {
	    //got the handler -- run it 
	    handler() 
	} else { 
	    //handlers in place , but none matched --- 
	    snd.error() 
	} 
    } else { 
	console.log("no handlers")
	//if no handlers registered will just send to the voice channel 
	VoiceChannel.write(text) 
    } 
})

export function reset() { 
    if (vi.recognition_state == "LISTENING" || vi.recognition_state == "PAUSED" ) { 
	stop() 
    } 
    VoiceChannel.flush() 
    handlers = null 
} 

export function init() {
    vi.initialize_recognition()
    window.state.snackbarInfo("Started Voice Recognition")
    setColor(false)
    
} 

export function stop() {
    vi.stop_recognition()
    window.state.snackbarInfo("Stopped Voice Recognition")
    setColor(true) 
} 


export function toggle() {
    if (vi.recognition_state == "LISTENING" ) {
	stop() 
    }  else { 
	init() 
    } 
} 

export function speak(msg :string) {
    
    vi.speak(msg) 
} 

var setColor : any  = null 


type Color = "primary" | "secondary" | "inherit" | "disabled" | "action" | "error" | undefined 

export function VoiceToggler() {
    
    let [color, _setColor]  = React.useState(true) 
    
    setColor = _setColor 
    
    let thecolor  = color ? 'action' : 'secondary' 
        
    return ( 
	<IconButton onClick={toggle}> 
	    <HeadsetMicIcon  color={(thecolor as Color)} /> 
	</IconButton>
    ) 
         

} 


export function voice_time() {
    let d = new Date() 
    let hrs = String( d.getHours() % 12 ) 
    let min =  String(d.getMinutes())
    if (min.length == 1) { 
	min = "0" + min 
    } 
    return `${hrs}:${min}` 
} 




export function set_handlers(_handlers : any) { 
    console.log("setting handlers") 
    console.log(handlers) 
    handlers = _handlers 
} 
