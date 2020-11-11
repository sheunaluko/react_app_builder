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

import * as mk from "./medkit" 

import { MenuComponents } from "./components/ComponentDictionary" 

declare var window : any  ;  
window.dev = dev 
window.mk = mk 


const theme = createMuiTheme({
    palette : { 
	primary: green
    } 
}) 



function App() {
    
    
    const [state, setState] = React.useState("diagnoser") 
    
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
		

	    </div>
	</ThemeProvider > 
    );
}

export default App;

