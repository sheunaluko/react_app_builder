import React from 'react';

import './App.css'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import Drawer from "./components/Drawer" 
import Reviewer from "./components/Reviewer" 
import Inputter from "./components/Inputter" 
import Info from "./components/Info" 
import Manual from "./components/Manual" 

import * as smgr from "./state_manager" 

import dream_catcher from "./dream_catcher.jpg" 

const MenuComponents : {[k:string] : any }  = { 
    "review" : <Reviewer />, 
    "input" : <Inputter /> , 
    "info" : <Info /> , 
    "manual" : <Manual /> , 
} 

function App() {
    
    
    const [state, setState] = React.useState("input") 

    smgr.register("setAppSelectedMenu", setState) 
    
    let toggle = ()=> smgr.get("drawerToggle")() 
    
    return (
	<div className="App" style={{display: "flex" , 
				     flexDirection: "column", 
				     backgroundImage:`url(${dream_catcher})`  }}>
	    
	    <AppBar position="static">
		<Toolbar>
		    <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggle} >
			<MenuIcon />
		    </IconButton>
		    <Typography variant="h6" >
			DreamCatcher
		    </Typography>
		</Toolbar>
	    </AppBar>
	    <Drawer /> 
	    
	    { MenuComponents[state] } 
	    
	    
	</div>
    );
}

export default App;
