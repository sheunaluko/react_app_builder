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
import Console from "./ConsoleElement" 

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
    'Test' : { 
	typography : typography1 , 
	palette : { 
	    primary : yellow, 
	    secondary : teal, 
	} 
	
    },     
    'Fireplace' : { 
	typography : typography1 , 
	palette : { 
	    primary : brown, 
	    secondary : deep_orange, 
	} 
	
    }, 
    
    'Default' : { 
	typography : typography1 , 
	palette : { 
	    primary : indigo, 
	    secondary : grey, 
	} 
	
    }, 
    'Purple' : { 
	typography : typography1 , 
	palette : { 
	    primary : deep_purple, 
	    secondary : blue_grey , 
	} 
	
    }, 
    'None' : {} , 
    'Stars' :  { 
	typography : typography1 , 
	palette : { 
	    primary : {main  : "#212121" } , 
	    secondary : {main  : "#f57c00" } , 
	} 
    } , 
    'Earth' :  { 
	typography : typography1 , 
	palette : { 
	    primary : brown, 
	    secondary : green , 
	} 
    } ,
    'Stone' : { 
	typography : typography1 , 
	palette : { 
	    primary : grey, 
	    secondary : brown , 
	} 
	
    } , 
    'Wood' : { 
	typography : typography1 , 
	palette : { 
	    primary : brown, 
	    secondary : grey , 
	} 
	
    } ,
} 

		       
//let init_component = "wikidata_entity_maker" 
let init_component = "entity_editor" 

function App() {
    
    const [state, setState] = React.useState(init_component) 


    
    const [theme_str,setTheme] = React.useState('Default') 
    
    const theme = createMuiTheme(themes[theme_str])         
    
    const [subheader, setSubheader] = React.useState(null)             
    
    smgr.register("set_subheader", setSubheader) 
    smgr.register("set_theme", setTheme)     
    smgr.register("theme_str", theme_str)         
    
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
		
		{
		    <Console /> 
		}
		

	    </div>
	</ThemeProvider > 
    );
}

export default App;

