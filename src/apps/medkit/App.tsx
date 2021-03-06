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


import * as tsw from "tidyscripts_web" 
import * as dev from  "./dev/index"

import * as smgr from './state_manager' 

import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';

import * as mk from "./medkit" 

import { MenuComponents } from "./components/ComponentDictionary" 

import {
    Button, 
} from "./components/list" 

import purple from '@material-ui/core/colors/purple';
import green from '@material-ui/core/colors/green';
import grey from '@material-ui/core/colors/grey';
import orange from '@material-ui/core/colors/orange';
import brown from '@material-ui/core/colors/brown';
import blue from '@material-ui/core/colors/blue';
import red from '@material-ui/core/colors/red';
import pink from '@material-ui/core/colors/pink';
import deep_purple from '@material-ui/core/colors/deepPurple';
import indigo from '@material-ui/core/colors/indigo';
import light_blue from '@material-ui/core/colors/lightBlue';
import cyan from '@material-ui/core/colors/cyan';
import teal from '@material-ui/core/colors/teal';
import light_green from '@material-ui/core/colors/lightGreen';
import lime from '@material-ui/core/colors/lime';
import yellow from '@material-ui/core/colors/yellow';
import amber from '@material-ui/core/colors/amber';
import deep_orange from '@material-ui/core/colors/deepOrange';
import blue_grey from '@material-ui/core/colors/blueGrey';

declare var window : any  ;  
window.dev = dev 
window.mk = mk 


//create some custom themes 
const typography1 = { 
    fontFamily: [
	'"Helvetica Neue"',
	'Arial',
	'sans-serif',
	'"Apple Color Emoji"',
	'"Segoe UI Emoji"',
	'"Segoe UI Symbol"',
    ].join(','),
    fontSize: 13,
} 

/*
   import purple from '@material-ui/core/colors/purple';
   import green from '@material-ui/core/colors/green';
   import grey from '@material-ui/core/colors/grey';
   import orange from '@material-ui/core/colors/orange';
   import brown from '@material-ui/core/colors/brown';
   import blue from '@material-ui/core/colors/blue';
   import red from '@material-ui/core/colors/red';
   import pink from '@material-ui/core/colors/pink';
   import deep_purple from '@material-ui/core/colors/deepPurple';
   import indigo from '@material-ui/core/colors/indigo';
   import light_blue from '@material-ui/core/colors/lightBlue';
   import cyan from '@material-ui/core/colors/cyan';
   import teal from '@material-ui/core/colors/teal';
   import light_green from '@material-ui/core/colors/lightGreen';
   import lime from '@material-ui/core/colors/lime';
   import yellow from '@material-ui/core/colors/yellow';
   import amber from '@material-ui/core/colors/amber';
   import deep_orange from '@material-ui/core/colors/deepOrange';
   import blue_grey from '@material-ui/core/colors/blueGrey';

   
 */

const themes : any = { 
    'test' : { 
	typography : typography1 , 
	palette : { 
	    primary : yellow, 
	    secondary : teal, 
	} 
	
    },     
    'fireplace' : { 
	typography : typography1 , 
	palette : { 
	    primary : brown, 
	    secondary : deep_orange, 
	} 
	
    }, 
    
    'default' : { 
	typography : typography1 , 
	palette : { 
	    primary : indigo, 
	    secondary : grey, 
	} 
	
    }, 
    'purple' : { 
	typography : typography1 , 
	palette : { 
	    primary : deep_purple, 
	    secondary : blue_grey , 
	} 
	
    }, 
    'none' : {} , 
    'stars' :  { 
	typography : typography1 , 
	palette : { 
	    primary : {main  : "#212121" } , 
	    secondary : {main  : "#f57c00" } , 
	} 
    } , 
    'earth' :  { 
	typography : typography1 , 
	palette : { 
	    primary : brown, 
	    secondary : blue , 
	} 
    } ,
    'stone' : { 
	typography : typography1 , 
	palette : { 
	    primary : grey, 
	    secondary : brown , 
	} 
	
    } , 
    'wood' : { 
	typography : typography1 , 
	palette : { 
	    primary : brown, 
	    secondary : grey , 
	} 
	
    } ,
   
    
    
    
    
} 


const theme = createMuiTheme(themes.default) 


var console_cnt = 0 
let console_cntr = () => console_cnt++ ;
		       
//let init_component = "wikidata_entity_maker" 
let init_component = "diagnoser2" 

function App() {
    
    let default_text = [

	" - - - ",
	" - - - ",
	String(new Date()).split(" ").slice(0,5).join(" ")  , 	
	"Welcome to the MedKit UI Console!", 
	"Helpful information will be displayed here.", 
	"Use the button in the bottom right to toggle this window." , 
	" - - - ", 
    ]
    
    const [state, setState] = React.useState(init_component) 
    const [consoleState, setConsoleState] = React.useState(true)     
    const [console_text, setConsoleText] = React.useState(default_text)         
    
    const [subheader, setSubheader] = React.useState(null)             
    
    smgr.register("set_subheader", setSubheader) 
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
					 height : "100%"
	    }}>
		
		<AppBar position="static">
		    <Toolbar>
			<IconButton edge="start" color="inherit" aria-label="menu" onClick={toggle} >
			    <MenuIcon />
			</IconButton>
			<Box style={{display:'flex',flexDirection :'row'}}>
			    <Typography variant="h6" >
				MedKit
			    </Typography>
			    { 
				subheader ? 
				(<Typography 
				     variant="h6" 
				     style={{
					 color : theme.palette.secondary.dark,
					 marginLeft : "5px"}} > 
				    {"  >  " + subheader} 
				</Typography> ) : 
				null
			    } 
			</Box>
			
		    </Toolbar>
		</AppBar> 
		
		<LeftDrawer /> 
		<RightDrawer/> 
		
		<br/> 
		{ 
		    MenuComponents[state]
		} 
		
		
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
		

		

	    </div>
	</ThemeProvider > 
    );
}

export default App;

