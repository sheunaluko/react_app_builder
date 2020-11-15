import React from 'react';

import './App.css'

import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';


import LeftDrawer from "./components/LeftDrawer" 
import RightDrawer from "./components/RightDrawer" 



import WikiDataSearch from "./components/WikiDataSearch"  
import MeshSearch from "./components/MeshSearch2"  
import TestComponent from "./components/TestComponent" 
import ProblemList from "./components/ProblemList"
import MeshTreeAccordion from "./components/MeshTreeAccordion"


import { ThemeProvider } from '@material-ui/core/styles';
import { createMuiTheme } from '@material-ui/core/styles';

import purple from '@material-ui/core/colors/purple';
import green from '@material-ui/core/colors/green';
import blue from '@material-ui/core/colors/blue';

import * as tsw from "tidyscripts_web" 
import * as dev from  "./dev"

import * as smgr from './state_manager' 

import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';

import * as mk from "./medkit" 

import { MenuComponents } from "./components/ComponentDictionary" 

import {
    Button, 
} from "./components/list" 



declare var window : any  ;  
window.dev = dev 
window.mk = mk 


const theme = createMuiTheme({
    palette : { 
	primary: green
    } 
}) 

var console_cnt = 0 
let console_cntr = () => console_cnt++

function App() {
    
    let default_text = [
	"[" + String(new Date()).split(" ").slice(0,5).join(" ") + "] - Initialized" , 
	"Welcome to the MedKit UI Console", 
	"Helpful information will be displayed here", 
	"Use the button in the bottom right to toggle this window" , 
	"Take care!", 
    ]
    
    const [state, setState] = React.useState("diagnoser") 
    const [consoleState, setConsoleState] = React.useState(false)     
    const [console_text, setConsoleText] = React.useState(default_text)         
    
    smgr.register("console_text" , console_text) 
    smgr.register("setConsoleText" , setConsoleText)     
    smgr.register("addConsoleText" , function(t:string) { 
	
	let new_lines = console_text.slice(1,console_text.length)
	new_lines.push(t)
	setConsoleText( new_lines) 
	
    })
    
    let selectedSetter = function(s : string) {
	//then change the UI 
	setState(s) 
    } 
    
    smgr.register("setAppSelectedMenu", selectedSetter) 
    
    let toggle = ()=> smgr.get("drawerToggle")() 
    
    return (
	<ThemeProvider theme={theme}> 
	    <div className="App" style={{display: "flex" , 
					 flexDirection: "column", 
	    }}>
		
		<AppBar position="static">
		    <Toolbar>
			<IconButton edge="start" color="inherit" aria-label="menu" onClick={toggle} >
			    <MenuIcon />
			</IconButton>
			<Typography variant="h6" style={{flexGrow : 1}} >
			    MedKit
			</Typography>
		    </Toolbar>
		</AppBar> 
		
		<LeftDrawer /> 
		<RightDrawer/> 
		
		<br/> 
		{ 
		    MenuComponents[state]
		} 
		
		
		<div style={{
		    position: 'absolute',
		    bottom: "60px",
		    right: "30px",
		    borderRadius : "10px" ,
		    fontSize : "15px" , 
		    color : "black" ,
		    padding : "8px" , 
		    backgroundColor : "white", 
		    opacity : "0.5", 
		    visibility : consoleState ? "visible" : "hidden"  , 
		    width : "40%" , 
		}}>  
		    {console_text.map( (t:string)=> (<div key={console_cntr()}> {t} </div>)  ) } 
		</div>
		
		
		<div style={{
		    position: 'absolute',
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
		

		

	    </div>
	</ThemeProvider > 
    );
}

export default App;

