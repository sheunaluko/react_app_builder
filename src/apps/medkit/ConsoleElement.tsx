import React from 'react';

import {
    Button, 
} from "./components/list" 


import * as smgr from './state_manager' 


// - 
var console_cnt = 0 
let console_cntr = () => console_cnt++ ;


export default function Console() {
    
    let default_text = [

	" - - - ",
	" - - - ",
	String(new Date()).split(" ").slice(0,5).join(" ")  , 	
	"Welcome to the MedKit UI Console!", 
	"Helpful information will be displayed here.", 
	"Use the button in the bottom right to toggle this window." , 
	" - - - ", 
    ]
    
    const [console_text, setConsoleText] = React.useState(default_text)  
    const [consoleState, setConsoleState] = React.useState(true)     
    
    
    smgr.register("setConsoleText" , setConsoleText)     
    
    
    smgr.register("addConsoleText" , function(t:string) { 
	
	let new_lines = console_text.slice(1,console_text.length)
	new_lines.push(t)
	setConsoleText( new_lines) 
	
    })
    
    return (
    	   <React.Fragment >
		<div style={{
		    position: 'fixed',
		    bottom: "60px",
		    right: "30px",
		    borderRadius : "10px" ,
		    fontSize : "15px" , 
		    color : "black" ,
		    padding : "8px" , 
		    backgroundColor : "white", 
		    opacity : "0.6", 
		    visibility : consoleState ? "visible" : "hidden"  , 
		    width : "40%" , 
		}}>  
		    {console_text.map( (t:string)=> (<div key={console_cntr()}> {t} </div>)  ) } 
		</div>
		
		
		<div style={{
		    position: 'fixed',
		    bottom: "10px",
		    right: "30px",
		    fontSize : "30px" , 
		    //width : "10%" , 
		    //height : "10%" , 
		}}> 
		    <Button variant="outlined" 
			    color="primary" 
			    onClick={function(){setConsoleState(!consoleState)}} 
			//onMouseOver={function(){setConsoleState(!consoleState)}} 
		    > > </Button>
		</div>
					</React.Fragment> 
					
	)

}


