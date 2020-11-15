import React from 'react' 
import {useState} from 'react'
import { useTheme } from "@material-ui/core/styles";


import * as tsw from 'tidyscripts_web' 



import {
    Container, 
    Box , 
    Button
} from "./list" 

let keysounds = tsw.apis.bind_sounds_to_keys  
let handlers = keysounds.sound_key_handler(keysounds.keys_to_notes_1(keysounds.keys),30,"1.4")

let log = console.log

declare var window : any ; 

var key_states :any  = {} 


window.onkeydown = function (k :any) { 
    let key = k.key 
   activate(key)     
}



window.onkeyup = function (k :any) { 
    let key = k.key 
    deactivate(key)
}

function activate(key:string) {
    let f = key_states[key]
    if (f) {f(true)} 
    let h = handlers[key]
    if (h) {h()}
} 

function deactivate(key:string){
    let f = key_states[key] 
    if (f) { f(false) } 
} 


export default function Widget() { 
    
    const theme = useTheme();

    
    return ( 
	<Container >  
	    <div
		style={{
		    backgroundColor: theme.palette.background.paper,
		    padding: "2%",
		    borderRadius: "15px"
		}}
            >

		
		<Box> 
		    <KeyRows kss={['hi','mid','lo'].map((s:string)=> keysounds.keys[s] ) } />
		</Box>
	    </div>
	    
	</Container> 
	
    )
    
} 




function KeyElement(props : any) { 
    
    let [state,setState] = useState(false)
    
    key_states[props.k] = setState
    
    return ( 
	<div style={{margin : "4px"}}> 
	    <Button id={props.k} variant="outlined" color={ state ? "secondary" : "primary" } onClick={function(){ 
		    //if we click the button should activate it and trigger a sound
		    log("button clicked: " + props.k)
		    activate(props.k) 
		    setTimeout( ()=> deactivate(props.k) , 500) 
		}}> {props.k} </Button>
	</div> 
    ) 
} 

function KeyRow(props : any) {
    return  ( 
	<div style={{display: "flex", 
		     justifyContent : "center", 
		     flexDirection : "row"}}> 
	    {
		props.ks.map( (k :string)=> <KeyElement k={k} key={k} /> ) 
	    } 
	</div> 
    ) 
}

function KeyRows(props: any) {
    return  ( 
	<div style={{display: "flex", 
		     flexDirection : "column"}}> 
	    {
		props.kss.map( (ks :string[])=> <KeyRow ks={ks} key={ks[0]} /> ) 
	    } 
	</div> 
    ) 
    
} 
